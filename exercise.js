var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(
    process.env.MONGO_URI,
    { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  ); 

const Schema = mongoose.Schema;

/*** Exercise Tracker Model */
const exerciseSchema = new Schema(
    {
        description: 
        {
            type: String,
        },
        duration: 
        {
            type: Number,
        },
        date: Date
    }
)

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

const Exercise = mongoose.model("Exercise", exerciseSchema);
const User = mongoose.model("ExerciseUser", userSchema);

const createAndSaveUser = function (username, done) {
    const user = new User({username: username});

    user.save(function (err, data) {
        if (err) {
            done(err);
        }
        else {
            done(null, data);
        }
    });
}



/*** Exercise Tracker Controller */
const addNewUser = function(req, res, next) {
    console.log(req.body.newUser);

    const newUser = createAndSaveUser(req.body.newUser, function(err, data) {
        if (err) {
            return next(err);
        }

        res.json({
            username: data.username,
            _id: data._id
        });
    })


};

const addNewExercise = function(req, res, next) {
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
};

const getAllUsers = function (req, res, next) {
    res.send("Requesting an array of all users...")
};

const getExerciseLog = function (req, res, next) {
    console.log(req.query);
    res.send(`Requesting a full exercise log of user with userId ${req.query.userId}...`)
};

/*** Exercise Tracker Router */
router.post('/new-user', addNewUser);
router.post('/add', addNewExercise);
router.get('/users', getAllUsers);
router.get('/log', getExerciseLog);

/*** Exercise Tracker Module Export */
module.exports = router;