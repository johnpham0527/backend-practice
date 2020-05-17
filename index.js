const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/api/timestamp", (req, res) => {
    res.send("Request for Timestamp API received.")
})

app.listen(3000, () => {
    console.log("Hello world! Server is ready.");
});