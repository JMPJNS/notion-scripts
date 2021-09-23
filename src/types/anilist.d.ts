export interface AnilistResp {
    data: Data
}

export interface Data {
    MediaListCollection: MediaListCollection
}

export interface MediaListCollection {
    lists: List[]
}

export interface List {
    entries: Entry[]
}

export interface Entry {
    status:          Status
    score:           number
    progress:        number
    progressVolumes: null
    startedAt:       EntryDate
    completedAt:     EntryDate
    media:           Media
}

export interface EntryDate {
    year:  number | null
    month: number | null
    day:   number | null
}

export interface Media {
    siteUrl:         string
    coverImage:      CoverImage
    title:           Title
    episodes:        number | null
    chapters:        null
    season:          Season | null
    seasonYear:      number | null
    format:          Format
    type:            Type
    countryOfOrigin: CountryOfOrigin
    studios:         Studios
    staff:           Staff
}

export enum CountryOfOrigin {
    CN = "CN",
    Jp = "JP",
    Kr = "KR"
}

export interface CoverImage {
    extraLarge: string
}

export enum Format {
    Movie = "MOVIE",
    Ona = "ONA",
    Special = "SPECIAL",
    Tv = "TV",
    TvShort = "TV_SHORT",
    Novel = "NOVEL"
}

export enum Season {
    Fall = "FALL",
    Spring = "SPRING",
    Summer = "SUMMER",
    Winter = "WINTER",
}

export interface Staff {
    edges: StaffEdge[]
    nodes: StaffNode[]
}

export interface StaffEdge {
    role: string
}

export interface StaffNode {
    name: Name
}

export interface Name {
    userPreferred: string
}

export interface Studios {
    edges: StudiosEdge[]
    nodes: StudiosNode[]
}

export interface StudiosEdge {
    isMain: boolean
}

export interface StudiosNode {
    name: string
}

export interface Title {
    romaji:  string
    english: null | string
}

export enum Type {
    Anime = "ANIME",
    Manga = "MANGA",
}

export enum Status {
    Current = "CURRENT",
    Paused = "PAUSED",
    Planning = "PLANNING",
}
