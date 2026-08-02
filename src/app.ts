import express from "express"
const app = express()
app.get("/", (req, res) => {
    res.send("🚀 RaceHunter API Running!");
})

export default app;