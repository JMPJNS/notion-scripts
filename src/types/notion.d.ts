export interface NotionNumber {
    id?: string
    type: "number"
    number: number | null
}

export interface NotionRichText {
    id?: string
    type: 'rich_text'
    rich_text: NotionRichTextElement[]
}

export interface NotionRichTextElement {
    type: 'text'
    text: NotionText
    annotations?: NotionAnnotations
    plain_text?: string
    href?: string
}

export interface NotionAnnotations {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
}

export interface NotionText {
    content: string
    link?: string
}

export interface NotionSelectInner {
    id?: string
    name: string
    color?: string
}

export interface NotionSelect {
    id?: string
    type: 'select',
    select: NotionSelectInner
}

export interface NotionMultiSelect {
    id?: string
    type: 'multi_select'
    multi_select: NotionSelectInner[]
}

export interface NotionUrl {
    id?: string
    type: 'url'
    url: string
}

export interface NotionDate {
    id?: string
    type: 'date'
    date: {
        start: string,
        end?: string
    }
}

export interface NotionCreatedTime {
    id?: string
    type: 'created_time'
    created_time: string
}

export interface NotionName {
    id?: string
    type: "title"
    title: NotionTitle[]
}

export interface NotionTitle {
    type: "text"
    text: NotionText
    annotations?: NotionAnnotations
    plain_text?: string
    href?: null
}