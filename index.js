const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/api/timestamp", (req, res) => {
    let date = new Date();
    res.send({
        "unix": date.getTime(),
        "utc": date.toUTCString()
    });
})

app.get("/api/timestamp/:time", (req, res) => {
    res.send(`Received a time. It is ${req.params.time}`)
})

app.listen(3000, () => {
    console.log("Hello world! Server is ready.");
});