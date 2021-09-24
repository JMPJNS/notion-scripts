import notionSettings from "./notionSettings.js"

import express from "express"
import { updateMediaList } from "./modules/sync-anilist.js"
const app = express()
const port = process.env.PORT || 3000

console.log("starting")

app.get('/sync-anilist', async (req, res) => {
    const r = await updateMediaList()
    res.json(r)
})

app.get('/sync-anilist/full', async (req, res) => {
    const r = await updateMediaList(true)
    res.json(r)
})
  
app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})

await notionSettings.SetLastStartDate(new Date())

const i = setInterval(async x => {
    try {
        const s = await notionSettings.updateSettings()
        if (s.RunMediaListUpdate.toggle) {
            const d = new Date()
            d.setMinutes(d.getMinutes() - 30)
            if (d > s.LastMediaListUpdate.date) {
                await updateMediaList()
            }
        } else if(s.RunMediaListUpdate.singleRun) {
            console.log("switch - updating media list")
            await notionSettings.SetRunMediaListUpdate(s.RunMediaListUpdate.toggle, false)
            await updateMediaList()
        }
    }
    catch (e) {console.error(`exception occured in settings update interval`)}
}, 5*1000)

// await updateMediaList()