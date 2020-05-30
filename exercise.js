var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
var assert = require('assert');

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
    findOneUser(userId, function(err, userFound) {
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
    User.find({}, function (err, data) {
        if (err) {
            done(err);
        }
        else {
            done(null, data);
        }
    });
}

const findOneUser = function(userId, done) {
   User.findOne({_id: userId}, function(err, data) {
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

    createAndSaveUser(req.body.username, function(err, data) {
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
    
    //Check to see if a date was inputted
    let date;
    if (req.body.date.length > 0) {
        date = req.body.date;
    }
    else {
        let today = new Date();
        date = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
    }

    addExercise(req.body.userId, req.body.description, req.body.duration, date, function (err, data) {
        if (err) {
            return next(err);
        }
        else {
            let returnDate = new Date(req.body.date);

            res.json(
                {
                    username: data.username,
                    description: req.body.description,
                    duration: parseInt(req.body.duration),
                    userId: data._id,
                    date: returnDate.toDateString()
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

const isValidDate = (string) => {
    let date = new Date(string);

    if (Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date.getTime())) {
        return true;
    }

    return false;
}

const getExerciseLog = function (req, res, next) {
    findOneUser(req.query.userId, function (err, data) {
        if (err) {
            return next(err);
        }

        let logArray = data.log;

        if (isValidDate(req.query.from)) { //a valid "from" date was provided
            logArray = logArray.filter((element) => {
                return element.date >= new Date(req.query.from + "T04:00:00.000+00:00") //return elements with date greater than or equal to the "from" date
            });
        }

        if (isValidDate(req.query.to)) { //a valid "to" date was provided
            logArray = logArray.filter((element) => {
                return element.date <= new Date(req.query.to + "T04:00:00.000+00:00") //return elements with date less than or equal to the "to" date
            });
        }

        if (!isNaN(req.query.limit)) { //a valid number was provided for req.query.limit
            logArray = logArray.slice(0, req.query.limit); //slice the array up to the given limit
        }


        res.json({
            _id: data._id,
            username: data.username,
            log: logArray,
            count: data.log.length
        });
    });
};


const test4 = function (req, res, next) {

}

/*** Exercise Tracker Router */
router.post('/new-user', addNewUser);
router.post('/add', addNewExercise);
router.get('/users', getAllUsers);
router.get('/log', getExerciseLog);
router.get('test4', test4);

/*** Exercise Tracker Module Export */
module.exports = router;