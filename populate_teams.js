const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const mongo_uri = process.env.MONGO_URI;
const mongo_db = "test";

var league_ids = [2014, 2021] // 2001 - champions league, 2014-primera division(la liga), 2021-premier league, 2019series a(italy)

const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
client.connect(function (err) {
  const collection = client.db(mongo_db).collection("teams");

  if(err) throw err;

  for (i in league_ids){
    const config = {
       headers: {'X-Auth-Token': process.env.FOOTBALL_DATA_KEY}
     };

    const request = axios.get(
      'https://api.football-data.org/v2/competitions/'+league_ids[i]+'/teams',
      config)
      .then((result) => {
        var teams = result.data['teams'];
        for(i in teams){
          var team = teams[i];
          // console.log(i + "=>    " + team['id'] + " " + team['name']);
          var team_doc = {'id': team['id'], 'name': team['name']}

          collection.insertOne(team_doc, {w: 1}, function(err, records){
            if (err){
              console.log("error when inserting new team: ", team_doc);
            }

            console.log("inserted: ", team_doc);
          });
        }
        client.close();
        res.status(200).send();
      })
      .catch(err => {
        // handle error
        console.log(err);
        client.close();
        res.status(500).send();
      });

  }

});
