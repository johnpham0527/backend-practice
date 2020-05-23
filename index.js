const express = require('express');
const app = express();
const expressip = require('express-ip');

app.use(expressip().getIpInfoMiddleware);

app.get("/api/whoami", (req, res) => {

    let ipaddress = req.ipInfo.ip;
    let software = req.headers["user-agent"];
    let language = req.headers["accept-language"];

    res.send({
        "ipaddress": ipaddress,
        "language": language,
        "software": software
    })
})

app.listen(3000, () => {
    console.log("Request Header Parser Microservice is ready.");
});

/*
Timestamp Project
const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
}

app.get("/api/timestamp", (req, res) => {
    let date = new Date();

    res.send({
        "unix": date.getTime(),
        "utc": date.toUTCString()
    });
})

app.get("/api/timestamp/:time", (req, res) => {
    let date;

    //check to see if req.params.time is not a number
    if (isNaN(req.params.time)) { //it's not a number, so process it as a string
        date = new Date(req.params.time);
    }
    else { //it's a number, so process it as a number
        date = new Date(parseInt(req.params.time));
    }
            
    if (isValidDate(date)) {
        res.send({
            "unix": date.getTime(),
            "utc": date.toUTCString()
        });
    }
    else {
        res.send({
            "error": "Invalid Date"
        });
    }
})
*/