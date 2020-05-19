const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/api/timestamp", (req, res) => {
    let d = new Date("2020-12-25");
    res.send(`Request for Timestamp API received. The set date is ${d}.`);
})

app.get("/api/test/:time", (req, res) => {
    res.send(`Received a time. It is ${req.params.time}`)
})

app.listen(3000, () => {
    console.log("Hello world! Server is ready.");
});