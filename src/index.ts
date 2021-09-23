import { Client } from "@notionhq/client"
import { updateMediaList } from "./modules/sync-anilist.js"
import { databases } from "./databases.js"
import {v4 as uuid} from "uuid"
import { Block } from "@notionhq/client/build/src/api-types"
import { MediaListEntry } from "./types/medialist.js"
import { PagesCreateResponse } from "@notionhq/client/build/src/api-endpoints"

const notion = new Client({
    auth: process.env.NOTION_TOKEN
})

await updateMediaList(notion)