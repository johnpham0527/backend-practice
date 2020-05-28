var express = require('express');
var router = express.Router();

/*** Exercise Tracker Router */

/**** Exercise Tracker */

const exerciseSchema = new Schema(
{
    description: 
    {
    type: String,
    required: true
    },
    duration: 
    {
    type: Number,
    required: true
    },
    date: Date
}
)

/*
const userSchema = new Schema(
{
    username: 
    {
    type: String,
    required: true
    },
    log: [exerciseSchema]
}
)
*/

const Exercise = mongoose.model("Exercise", exerciseSchema);
//const User = mongoose.model("userSchema", Schema);

const createAndSaveUser = function (username, done) {

}

const addNewExerciseUser = function(req, res, next) {
/*
1. Check to see if username already exists
2. If it doesn't, create it.
3. Return an object with a username and an _id
*/

console.log(req.body);
res.json({
    username: null,
    _id: null
});
}

router.post('/api/exercise/new-user', addNewExerciseUser);

router.post('/api/exercise/add', function (req, res, next) {
/*
1. Check if userid already exists. If it doesn't, return an error
2. Is a date provided? If not, then use today's date
3. Is duration a number? If not, return an error
4. Add description, duration and optional date information to the user object.
5. Return the user object with dates added
*/

console.log(req.body);
res.json({
    _id: null,
    username: null,
    description: null,
    duration: null,
    date: null
})
})

router.get('/api/exercise/users', function (req, res, next) {
res.send("Requesting an array of all users...")
})

router.get('/api/exercise/log', function (req, res, next) {
console.log(req.query);
res.send(`Requesting a full exercise log of user with userId ${req.query.userId}...`)
})

module.exports = router;