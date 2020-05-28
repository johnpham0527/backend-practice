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
        description: String,
        duration: Number,
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

const addExercise = function (userId, desc, dur, date_, done) {
    const user = findOneUser(userId, function(err, userFound) {
        if (err) {
            done(err);
        }
        else { //found a user. Now, add a new exercise to the user's log
            userFound.log.push({
                description: desc,
                duration: dur,
                date: date_
            })
            userFound.save(function(err, data) {
                if (err) {
                    done(err);
                }
                else {
                    done(null,data);
                }
            })
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

const findOneUser = function (userId, logLimit = 0, done) {
    let user;

    if (logLimit === 0) { //a log limit wasn't defined, so return all exercise logs
        user = User.findOne({_id: userId}, function(err, data) {
            if (err) {
                done(err);
            }
            else {
                done(null, data);
            }
        });
    }

    else { //a log limit was defined, so limit the number of array items to be returned
        user = User.find({_id: userId}, {log: {$slice: logLimit}}, function(err, data) {
            if (err) {
                done(err);
            }
            else {
                done(null, data);
            }
        });
    }
}

/*** Exercise Tracker Controller */
const addNewUser = function(req, res, next) {

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
    
    //Check to see if date exists and handle appropriately
    let date;
    if (req.body.date.length > 0) {
        date = req.body.date;
    }
    else {
        let today = new Date();
        date = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
    }

    const exercise = addExercise(req.body.userId, req.body.description, req.body.duration, date, function (err, data) {
        if (err) {
            return next(err);
        }
        else {
            res.json(
                {
                    _id: data._id,
                    username: data.username,
                    log: data.log
                }
            );
        }
    });
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