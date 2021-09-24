import { Client } from "@notionhq/client"
import { databases } from "./databases.js"

const notion = new Client({
    auth: process.env.NOTION_TOKEN
})

export class NotionSettings {
    private _lastMediaListUpdate: {date: Date, page_id: string}
    public async SetLastMediaListUpdate(d: Date) {
        await notion.pages.update({properties: {Date: {type: "date", date: {start: d.toISOString()}}}, page_id: this._lastMediaListUpdate.page_id, archived: false})
        this._lastMediaListUpdate.date = d
    }

    private _lastStartDate: {date: Date, page_id: string}
    public async SetLastStartDate(d: Date) {
        console.log(`setting last start date to ${d}`)
        await notion.pages.update({properties: {Date: {type: "date", date: {start: d.toISOString()}}}, page_id: this._lastStartDate.page_id, archived: false})
        this._lastStartDate.date = d
    }
    
    public get Settings() {
        return {
            LastMediaListUpdate: this._lastMediaListUpdate.date,
            LastStartDate: this._lastStartDate.date
        }
    }

    constructor(public notion: Client) {}
    async init() {
        await this.parseSettings()
        return this
    }

    private async parseSettings() {
        const rawSettings = await this.notion.databases.query({database_id: databases.statusDb})
        for (const x of rawSettings.results as any[]) {
            const name = x.properties.Name?.title?.[0].text.content
            if (!name) continue

            switch (name) {
                case "LastStartDate":
                    {
                    this._lastStartDate = {date: this.parseDate(x.properties.Date), page_id: x.id}
                    }
                case "LastMediaListUpdate":
                    {
                    this._lastMediaListUpdate = {date: this.parseDate(x.properties.Date), page_id: x.id}
                    }
            }
        }
    }

    private parseDate(x: any): Date | null {
        if (x?.date?.start) {
            return new Date(x.date.start)
        }
    }
}

const instance = await new NotionSettings(notion).init()
export default instance