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

// await updateMediaList()