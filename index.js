const express = require('express');
const app = express();
const expressip = require('express-ip');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const router = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());
app.use(expressip().getIpInfoMiddleware);

mongoose.connect(
    process.env.MONGO_URI,
    { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    }
  ); 
  
const Schema = mongoose.Schema;

const personSchema = new Schema(
{
    name: {
    type: String,
    required: true
    },
    age: Number,
    favoriteFoods: [String]
}
);

const Person = mongoose.model("Person", personSchema);

var createAndSavePerson = function(done) {
  var johnPham = new Person({name: "John Pham", age: 33, favoriteFoods: ["broccoli", "kale"]});

  johnPham.save(function (err, data) {
    if (err) {
      done(err);
    }
    done(null, data)
  });
};

let arrayOfPeople = [
    {name: "Leanna Pham", age: 3, favoriteFoods: ["blueberries", "smoothie"]},
    {name: "Yunji Pham", age: 38, favoriteFoods: ["apples", "bananas"]} 
   ];
   
var createManyPeople = function(arrayOfPeople, done) {
    
    Person.create(arrayOfPeople, function (err, people) {
        if (err) {
        done(err);
        }
        done(null, people);
    });
    
};

var findPeopleByName = function(personName, done) {

Person.find({name: personName}, function (err, personFound) {
    if (err) {
    done(err);
    }
    done(null, personFound);
});

};

var findOneByFood = function(food, done) {

    Person.findOne({favoriteFoods: food}, function(err, personFound) {
      if (err) {
        done(err);
      }
      else {
        done(null, personFound);
      } 
    });
    
};

var findPersonById = function(personId, done) {
  
  
    Person.findById({_id: personId}, function(err, personFound) {
     if(err) {
       done(err);
     }  
     else {
       done(null, personFound);
     } 
    });
    
};

var findEditThenSave = function(personId, done) {
    var foodToAdd = 'hamburger';
    
    Person.findById({_id: personId}, function (err, personFound) {
      if (err) {
        done(err);
      } 
      else {
        personFound.favoriteFoods.push(foodToAdd);
        personFound.save(function (err, data) {
          if (err) {
            done(err);
          }
          else {
            done(null, data);
          }
        });
      }
    });
    
};

var findAndUpdate = function(personName, done) {
    var ageToSet = 20;
  
    let person = Person.findOneAndUpdate({name: personName}, {age: ageToSet}, {new: true}, function(err, data) {
      if (err) {
        done(err);
      }
      else {
        done(null, data);
      }
    });
    
};

var removeById = function(personId, done) {
  
  
    var person = Person.findByIdAndRemove({_id: personId}, function(err, data) {
      if (err) {
        done(err);
      } 
      else {
        done(null, data);
      } 
    });
};

var removeManyPeople = function(done) {
    var nameToRemove = "Mary";
  
    var people = Person.remove({name: nameToRemove}, function(err, data) {
      if (err) {
        done(err);
      } 
      else {
        done(null, data);
      } 
    });
};



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