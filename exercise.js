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

const addExercise = function (userId, description, duration, date, done) {
    const user = findOneUser(userId, function(err, data) {
        if (err) {
            done(err);
        }
        else { //found a user. Now, add a new exercise to the user's log
            

        }
    });
};

const findAllUsers = function (done) {
    const allUsers = User.find({}, function (err, data) {
        if (err) {
            done(err);
        }
        else {
            done(null, data);
        }
    });
}

const findOneUser = function (userId, done) {
    const user = User.findOne({_id: userId}, function(err, data) {
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
    5. Return the user object with fields added
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
    const allUsers = findAllUsers(function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data.map(element => { //return only the ID and username
            return ({
                _id: element._id,
                username: element.username
            });
        }));
    });
};

const getExerciseLog = function (req, res, next) {
    //need to parse req.query to see if it contains userId, from, to, and limit. userId is required.

    const userLog = findOneUser(req.query.userId, function (err, data) {
        if (err) {
            return next(err);
        }
        data._doc.count = data.log.length; //add the length of the log array to count property
        res.json(
            {
                _id: data.id,
                log: data.log,
                count: data._doc.count
            }
        );
    });
};

/*** Exercise Tracker Router */
router.post('/new-user', addNewUser);
router.post('/add', addNewExercise);
router.get('/users', getAllUsers);
router.get('/log', getExerciseLog);

/*** Exercise Tracker Module Export */
module.exports = router;