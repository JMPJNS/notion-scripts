import { Client } from "@notionhq/client/build/src"
import { PagesCreateResponse } from "@notionhq/client/build/src/api-endpoints"
import fetch from "node-fetch"
import { databases } from "../databases.js"
import type { AnilistResp, Entry } from "../types/anilist.js"
import { MediaListEntry } from "../types/medialist.js"
import notionSettings from "../notionSettings.js"


const animeQuery = `query {
    MediaListCollection (userName: "JMPJNS", type:ANIME) {
      lists {
        entries {
          updatedAt
          status
          score
          progress
          status
          progressVolumes
          startedAt {
            year
            month
            day
          }
          completedAt {
            year
            month
            day
          }
          media {
            siteUrl
            coverImage {
              extraLarge
            }
            title {
              romaji
              english
            }
            episodes
            chapters
            season
            seasonYear
            format
            type
            countryOfOrigin
            studios {
              edges {
                isMain
              }
              nodes {
                name
              }
            }
            staff {
              edges {role}
              nodes {name{
                userPreferred
              }}
            }
          }
        }
      }
    }
  }`

const mangaQuery = `query {
MediaListCollection (userName: "JMPJNS", type:MANGA) {
    lists {
    entries {
        updatedAt
        status
        score
        progress
        status
        progressVolumes
        startedAt {
        year
        month
        day
        }
        completedAt {
        year
        month
        day
        }
        media {
        siteUrl
        coverImage {
          extraLarge
        }
        title {
            romaji
            english
        }
        episodes
        chapters
        season
        seasonYear
        format
        type
        countryOfOrigin
          studios {
            edges {
              isMain
            }
            nodes {
              name
            }
          }
          staff {
            edges {role}
            nodes {name{
              userPreferred
            }}
          }
        }
    }
    }
}
}`


export async function updateMediaList(fullSync = false) {
    const animeRes = await fetch("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ query: animeQuery, variables: {} }) })
    const mangaRes = await fetch("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ query: mangaQuery, variables: {} }) })

    const animeJson: AnilistResp = await animeRes.json() as any
    const mangaJson: AnilistResp = await mangaRes.json() as any

    const entries: Entry[] = []

    for (const l of animeJson.data.MediaListCollection.lists) {
        for (const e of l.entries) {
          entries.push(e)
        }
    }

    for (const l of mangaJson.data.MediaListCollection.lists) {
        for (const e of l.entries) {
          entries.push(e)
        }
    }

    const changeLog = []

    for (const e of entries) {
        let type = "Anime"
        if (e.media.type == "MANGA") type = "Manga"
        if (e.media.type == "MANGA" && e.media.countryOfOrigin == "KR") type = "Manhwa"
        if (e.media.type == "MANGA" && e.media.countryOfOrigin == "CN") type = "Manhua"
        if (e.media.format == "MOVIE") type = "Movie"
        if (e.media.format == "NOVEL") type = "Novel"

        const studio = e.media.studios.nodes[e.media.studios.edges.findIndex(x => x.isMain)]?.name
        const author = e.media.staff.nodes[e.media.staff.edges.findIndex(x => x.role == "Director" || x.role == "Story" || x.role == "Story & Art")]?.name?.userPreferred;

        if (!e.media.title.romaji) {
          console.error(`${e.media.siteUrl} doesn't have a romaji title, can't insert`)
          continue
        }

        const change = await updateEntry(e, {studio, author, type, fullSync}).catch(error => {
          console.error(`error occured on ${e.media.title.romaji}`, error)
        })

        if (change) changeLog.push(change)
    }
    await notionSettings.SetLastMediaListUpdate(new Date())
    return changeLog
}

async function updateEntry(entry: Entry, additional: {studio: string, author: string, type: string, fullSync: boolean}) {
  const notion = notionSettings.notion
  if (!additional.fullSync) {
    const d = new Date(entry.updatedAt*1000)
    if (notionSettings.Settings.LastMediaListUpdate > d) {
      console.log(`ignoring ${entry.media.title.romaji}, hasn't been changed since last update`)
      return {status: "ignored", entry: entry.media.title.romaji}
    }
  }
  const found = await notion.databases.query({database_id: databases.mediaList, filter: {property: "Link", text: {contains: entry.media.siteUrl}}});

  if (found.results.length > 0) {
    let update = false
    const res: any = found.results[0]
    const props: MediaListEntry = {} as MediaListEntry
    if (entry.progress > res.properties["Progress"].number) {
      props["Progress"] = {type: "number", number: entry.progress}
      update = true
    }
    if ((entry.media.episodes ?? entry.media.chapters) > res.properties["Total"].number) {
      props["Total"] = {type: "number", number: entry.media.episodes ?? entry.media.chapters}
      update = true
    }
    if (entry.status != res.properties["Status"].select.name) {
      props["Status"] = {type: "select", select: {name: entry.status}}
      update = true
    }

    if (update) {
      console.log(`updating ${entry.media.title.romaji}`)
      await notion.pages.update({page_id: res.id, properties: props as any, archived: false})
      return {status: "updated", entry: entry.media.title.romaji}
    } else {
      console.log(`not updating ${entry.media.title.romaji}, nothing changed`)
      return {status: "ignored", entry: entry.media.title.romaji}
    }
  }

  const props: MediaListEntry = {} as MediaListEntry
  if (additional.studio ?? additional.author)
    props["Author / Studio"] = {type: "rich_text", rich_text: [{text: {content: additional.studio ?? additional.author}, type: "text"}]}
  props["Hype / Score"] = {type: "number", number: entry.score}

  props["Link"] = {type: "url", url: entry.media.siteUrl}
  props["Name"] = {type: "title", title: [{type: "text", text: {content: entry.media.title.romaji}}]}
  if (entry.media.title.english)
    props["English"] = {type: "rich_text", rich_text: [{type: "text", text: {content: entry.media.title.english}}]}
  props["Progress"] = {type: "number", number: entry.progress}
  if (entry.media.episodes ?? entry.media.chapters)
    props["Total"] = {type: "number", number: entry.media.episodes ?? entry.media.chapters}
  props["Status"] = {type: "select", select: {name: entry.status}}
  props["Type"] = {type: "multi_select", multi_select: [{name: additional.type}]}

  console.log(`inserting ${entry.media.title.romaji}`)
  const created = await notion.pages.create({parent: {database_id: databases.mediaList}, properties: props as any}).catch(console.error)

  await notion.blocks.children.append({block_id: (created as PagesCreateResponse).id, children: [
      {embed: {url: entry.media.coverImage.extraLarge}, type: "embed"} as any
  ]})

  return {status: "inserted", entry: entry.media.title.romaji}
}