const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/api/timestamp", (req, res) => {
    let d = new Date();
    res.send(`Request for Timestamp API received. The current time is ${d}`);
})

app.listen(3000, () => {
    console.log("Hello world! Server is ready.");
});