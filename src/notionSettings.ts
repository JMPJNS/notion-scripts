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

    private _runMediaListUpdate: {page_id: string, toggle: boolean, singleRun: boolean}
    public async SetRunMediaListUpdate(toggle: boolean, singleRun = false) {
        await notion.pages.update({properties: {
            "Single-Run": {type: "checkbox", checkbox: singleRun}, 
            "Toggle": {type: "checkbox", checkbox: singleRun}
        }, page_id: this._runMediaListUpdate.page_id, archived: false})
        
        this._runMediaListUpdate.toggle = toggle,
        this._runMediaListUpdate.singleRun = singleRun
    }

    private _forceFullMediaListUpdate: {page_id: string, toggle: boolean}
    
    public get Settings() {
        return {
            LastMediaListUpdate: this._lastMediaListUpdate,
            LastStartDate: this._lastStartDate,
            RunMediaListUpdate: this._runMediaListUpdate,
            ForceFullMediaListUpdate: this._forceFullMediaListUpdate,
        }
    }

    constructor(public notion: Client) {}
    async init() {
        await this.updateSettings()
        return this
    }

    public async updateSettings() {
        const rawSettings = await this.notion.databases.query({database_id: databases.statusDb})
        for (const x of rawSettings.results as any[]) {
            const name = x.properties.Name?.title?.[0].text.content
            if (!name) continue

            switch (name) {
                case "LastStartDate":
                    {
                    this._lastStartDate = {date: this.parseDate(x.properties.Date), page_id: x.id}
                    break
                    }
                case "LastMediaListUpdate":
                    {
                    this._lastMediaListUpdate = {date: this.parseDate(x.properties.Date), page_id: x.id}
                    break
                    }
                case "RunMediaListUpdate":
                    {
                    this._runMediaListUpdate = {page_id: x.id, toggle: x.properties["Toggle"].checkbox, singleRun: x.properties["Single-Run"].checkbox}
                    break
                    }
                case "ForceFullMediaListUpdate":
                    {
                    this._forceFullMediaListUpdate = {page_id: x.id, toggle: x.properties["Toggle"].checkbox}
                    break
                    }
            }
        }

        return this.Settings
    }

    private parseDate(x: any): Date | null {
        if (x?.date?.start) {
            return new Date(x.date.start)
        }
    }
}

const instance = await new NotionSettings(notion).init()
export default instance