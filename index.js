const express = require('express');
const app = express();
const expressip = require('express-ip');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const bodyParser = require('body-parser');
const path = require('path');

express.static("/");
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());
app.use(expressip().getIpInfoMiddleware);

// global setting for safety timeouts to handle possible
// wrong callbacks that will never be called
var timeout = 10000;

mongoose.connect(
    process.env.MONGO_URI,
    { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    }
  ); 


/*** Mongoose */
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

/*** Mongoose Routes */

app.get('/is-mongoose-ok', function(req, res) {
    if (mongoose) {
      res.json({isMongooseOk: !!mongoose.connection.readyState})
    } else {
      res.json({isMongooseOk: false})
    }
});

app.use(function(req, res, next) {
    if(req.method !== 'OPTIONS' && Person.modelName !== 'Person') { 
      return next({message: 'Person Model is not correct'});
    }
    next();
});

app.get('/mongoose-model', function(req, res, next) {
    var p;
    p = new Person(req.body);
    res.json(p);
});

app.get('/create-and-save-person', function(req, res, next) {
    /*
    I want to update this function so that it can check to see if parameters exist. 
    The parameters are name, age, and favoriteFoods.
    They can be called like this: /create-and-save-person?name=John&age&33&favoriteFoods=strawberries,blueberries
    Need to call req.query.favoriteFoods.split(',')
    If no parameters exist, do not create anything.

    Figure out how to create a new Person if certain parameters aren't provided (such as age or favoriteFoods)

    //var p = new Person({name: 'test', age: 0, favoriteFoods: ['none']});
    */


    console.log(req.query);

    
    const name = req.query.name || null;
    const age = req.query.age || null;
    const favoriteFoods = req.query.favoriteFoods || null;
    const favoriteFoodsArray = favoriteFoods ? favoriteFoods.split(',') : null;

    console.log(name, age, favoriteFoodsArray);
    




    // in case of incorrect function use wait timeout then respond
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    createAndSavePerson(function(err, data) {
      clearTimeout(t);
      if(err) { return (next(err)); }
      if(!data) {
        console.log('Missing `done()` argument');
        return next({message: 'Missing callback argument'});
      }
       Person.findById(data._id, function(err, pers) {
         if(err) { return (next(err)); }
         res.json(pers);
         pers.remove();
       });
    });
});




app.post('/find-all-by-name', function(req, res, next) {
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    Person.create(req.body, function(err, pers) {
      if(err) { return next(err) }
      findPersonByName(pers.name, function(err, data) {
        clearTimeout(t);
        if(err) { return next(err) }
        if(!data) {
          console.log('Missing `done()` argument');
          return next({message: 'Missing callback argument'});
        }
        res.json(data);
        Person.remove().exec();
      });
    });
});

app.post('/find-one-by-food', function(req, res, next) {
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    var p = new Person(req.body);
    p.save(function(err, pers) {
      if(err) { return next(err) }
      findOneByFood(pers.favoriteFoods[0], function(err, data) {
        clearTimeout(t);
        if(err) { return next(err) }
        if(!data) {
          console.log('Missing `done()` argument');
          return next({message: 'Missing callback argument'});
        }
        res.json(data);
        p.remove();
      });
    });
  });

app.get('/find-by-id/:userID', function(req, res, next) {
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    
    /*
    var p = new Person({name: 'test', age: 0, favoriteFoods: ['none']});
    p.save(function(err, pers) {
      if(err) { return next(err) }
      findPersonById(pers._id, function(err, data) {
        clearTimeout(t);
        if(err) { return next(err) }
        if(!data) {
          console.log('Missing `done()` argument');
          return next({message: 'Missing callback argument'});
        }
        res.json(data);
        p.remove();
      });
    });
    */

    //res.send(req.params.userID);
    //5ec97c439df40c325d2545b3

    findPersonById(req.params.userID, function (err, data) {
        if (err) {
            return next(err);
        }
        else {
            res.json(data);
        }
    });

  });



app.post('/find-edit-save', function(req, res, next) {
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    var p = new Person(req.body);
    p.save(function(err, pers) {
        if(err) { return next(err) }
        try {
        findEditThenSave(pers._id, function(err, data) {
            clearTimeout(t);
            if(err) { return next(err) }
            if(!data) {
            console.log('Missing `done()` argument');
            return next({message: 'Missing callback argument'});
            }
            res.json(data);
            p.remove();
        });
        } catch (e) {
        console.log(e);
        return next(e);
        }
    });
});

app.post('/find-one-update', function(req, res, next) {
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    var p = new Person(req.body);
    p.save(function(err, pers) {
      if(err) { return next(err) }
      try {
        findAndUpdate(pers.name, function(err, data) {
          clearTimeout(t);
          if(err) { return next(err) }
          if (!data) {
            console.log('Missing `done()` argument');
            return next({ message: 'Missing callback argument' });
          }
          res.json(data);
          p.remove();
        });
      } catch (e) {
        console.log(e);
        return next(e);
      }
    });
  });
  
app.post('/remove-one-person', function(req, res, next) {
    Person.remove({}, function(err) {
        if(err) { return next(err) }
        var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
        var p = new Person(req.body);
        p.save(function(err, pers) {
        if(err) { return next(err) }
        try {
            removeById(pers._id, function(err, data) {
            clearTimeout(t);
            if(err) { return next(err) }
            if(!data) {
                console.log('Missing `done()` argument');
                return next({message: 'Missing callback argument'});
            }
            console.log(data)
            Person.count(function(err, cnt) {
                if(err) { return next(err) }
                data = data.toObject();
                data.count = cnt;
                console.log(data)
                res.json(data);
            })
            });
        } catch (e) {
            console.log(e);
            return next(e);
        }
        });
    });
});

app.post('/remove-many-people', function(req, res, next) {
    Person.remove({}, function(err) {
      if(err) { return next(err) }
      var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
      Person.create(req.body, function(err, pers) {
        if(err) { return next(err) }
        try {
          removeManyPeople(function(err, data) {
            clearTimeout(t);
            if(err) { return next(err) }
            if(!data) {
              console.log('Missing `done()` argument');
              return next({message: 'Missing callback argument'});
            }
            Person.count(function(err, cnt) {
              if(err) { return next(err) }
              if (data.ok === undefined) {
                // for mongoose v4
                 try {
                  data = JSON.parse(data);
                } catch (e) {
                  console.log(e);
                  return next(e);
                }
              }
              res.json({
                n: data.n,
                count: cnt,
                ok: data.ok
              });
            })
          });
        } catch (e) {
          console.log(e);
          return next(e);
        }
      });
    })
  });


/*** URL Shortener Microservice */


app.post('/api/shorturl/new', function(req, res, next) {
//To-do: figure out how to send POST request using Postman

  let originalUrl = req.body.url;
  res.send({
    "original_url": originalUrl,
    "short_url": null
  });

  console.log(req.body);
})

app.get('/api/shorturl/:url', function(req, res, next) {
  console.log(req.params.url);
  res.send(`Received ${req.params.url}`)
})


app.listen(3000, () => {
    console.log("Mongoose Project is ready.");
});

/** Who Am I API */
/*
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
*/


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
