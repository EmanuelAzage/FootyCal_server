require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const mongo_uri = process.env.MONGO_URI;
const mongo_db = "dev";

const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
client.connect(function (err) {
  if(err) throw err;

  const collection = client.db(mongo_db).collection("users");

  var query = {id: -10};

  collection.deleteMany(query, function(err, obj) {
    if (err) throw err;
    client.close();
  });

});
