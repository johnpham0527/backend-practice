const express = require('express');
const app = express();

const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
}

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
    let date = new Date(req.params.time);
    
    //check to see if date is a valid Date object
    if (isValidDate(date)) {
        console.log("This is a valid date.")
    }
    else {
        console.log("This is not a valid date.")
    }

    res.send(`Received a time. It is ${req.params.time}`)
})

app.listen(3000, () => {
    console.log("Hello world! Server is ready.");
});