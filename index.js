let express = require('express');
let app = express();

app.get("/", (req, res) => {
    console.log("Hello world");
});

app.listen(process.env.PORT || 3000);