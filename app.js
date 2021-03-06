require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8080;
const mongo_uri = process.env.MONGO_URI;
const mongo_db = "dev";
const protect = require('./middleware/protect');

app.use(bodyParser.json());
app.use(cors());

// creates a user on the mongo db given a users information
app.post('/auth/create_user',(req, res) =>{

  const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
  client.connect(function (err) {
    const collection = client.db(mongo_db).collection("users");

    if(err) throw err;

    console.log("body: ", req.body);

    var doc = {'id': req.body.id, 'email': req.body.email, 'password': req.body.password}

    collection.insertOne(doc, {w: 1}, function(err, records){
      if (err){
        client.close();
        console.log("error when inserting new user: ", err);
        res.status(500).send();
      }

      console.log("inserted: ", doc);

      client.close();
      res.status(200).json(doc);
    });

  });
});

// returns an access token given a user
app.post('/auth/token', (req, res) => {
  //find user for id and compare password in mongo with password in request
  const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
  client.connect(function (err) {
    if(err) {
      console.log('error on mongo connection: ', err);
      res.status(500).send();
    }

    const collection = client.db(mongo_db).collection("users");

    var query = {'id':req.body.id};

    collection.findOne(query, function(err, doc) {
      if(!doc){ // couldn't find the user
        client.close();
        res.status(404).send();
      }else{
        if(req.body.password === doc['password']){
          client.close();
          let token = jwt.sign({ password: req.body.password }, process.env.SECRET_KEY);
          console.log('sent token: ', token);
          res.status(200).json({ token });
        } else {
          client.close();
          res.status(401).send();
        }
      }

    });

  });


});

app.use(protect);

// get multiple team resources
app.get('/api/allteams', (req, res) => {
    const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
    client.connect(function (err) {
      const collection = client.db(mongo_db).collection("teams");

      if(err) throw err;

      var query = {};

      collection.find(query).toArray(function(err, docs) {
        if(!docs){
          client.close();
          res.status(401).end();
        }else{

          res.json(docs);
          client.close();
        }
      });

    });
});

// get single user resource
app.get('/api/user/:id', (req, res) => {

  var user_id = parseInt(req.params.id);

  const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
  client.connect(function (err) {
    const collection = client.db(mongo_db).collection("users");

    if(err) throw err;

    var query = {'id': user_id};

    collection.findOne(query, function(err, doc) {
      if(err || !doc){
        console.log("err: ", err);
        console.log("doc: ", doc)
        client.close();
        res.status(404).end();
      } else {
        console.log("success");
        res.status(200).json(doc);
        client.close();
      }

    });

  });
});

// replaces the teams monitered with the new teams passed in the request for the user
app.patch('/api/update_user_teams', (req, res) => {
  var user_id = req.body.id;
  var teams = req.body.teams;

  const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
  client.connect(function (err) {
    const collection = client.db(mongo_db).collection("users");

    if(err) throw err;

    var query = {'id': user_id};
    var newval = {"$set": {"teams": teams}};

    collection.findOneAndUpdate(query, newval, function(err, doc) {
      if(err){
        console.log('update teams failed');
        client.close();
        res.status(404).end();
      }else{
        console.log('update teams success');
        res.status(200).send();
        client.close();
      }
    });

  });

});

// removes all monitered teams for the user
app.delete('/api/delete_teams', (req, res) => {
  var user_id = req.body.id;
  const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
  client.connect(function (err) {
    const collection = client.db(mongo_db).collection("users");

    if(err) throw err;

    var query = {'id': user_id};
    var newval = {"$unset": {"teams": ""}};

    collection.findOneAndUpdate(query, newval, function(err, doc) {
      if(err || !doc){
        console.log('delete failed');
        client.close();
        res.status(404).send();
      }else{
        console.log('delete success');
        res.status(200).send();
        client.close();
      }
    });

  });


});

// returns the upcoming matches of the teams monitered by the user with the given id
app.get('/api/upcoming_matches/:id', (req, res) => {
  var user_id = parseInt(req.params.id);
  const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
  client.connect(function (err) {
    const collection = client.db(mongo_db).collection("users");

    if(err) throw err;

    var query = {'id': user_id};

    collection.findOne(query, function(err, doc) {
      if(err || !doc){
        client.close();
        res.status(404).end();
      } else {

        // use list of teams to get all matches that are scheduled for each team
        var teams = doc['teams'];
        const config = {
           headers: {'X-Auth-Token': process.env.FOOTBALL_DATA_KEY}
         };
        if (teams){
          var linksArr = [];
          for (i in teams){
            linksArr.push(`https://api.football-data.org//v2/teams/${teams[i].id}/matches?status=SCHEDULED`);
          }
          axios.all(linksArr.map(url => axios.get(url,config)))
          .then(axios.spread(function (...result) {
            // all requests are now complete
            var data = [];
            for(i in result){
              data.push.apply(data, result[i].data.matches);
            }

            //Sort matches by date ascending
            data.sort(function(a,b){
              return new Date(a.utcDate) - new Date(b.utcDate);
            });

            var matches = [];
            var matchIds = [];
            for(i in data){
              var datetime = new Date(data[i].utcDate);
              var date = datetime.toISOString().split('T')[0];
              var time = datetime.toISOString().split('T')[1];
              time = time.split(':')[0] + ':' + time.split(':')[1];
              var match = {
                'id': data[i].id,
                'date': date,
                'time': time,
                'home_team': data[i].homeTeam.name,
                'away_team': data[i].awayTeam.name
              };
              if(matchIds.indexOf(match.id) < 0){ // avoid duplicates if user team has 2 teams that will play each other
                matches.push(match);
                matchIds.push(match.id);
              }
            }

            client.close();
            res.status(200).json(matches);
          }));
        } else{
          client.close();
          res.status(200).json([]);
        }
      }

    });

  });
});


app.listen(port, () => console.log(`listening on port ${port}!`));
