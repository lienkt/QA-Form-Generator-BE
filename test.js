console.log('Hello MongoDB!')
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Find questions have difficulty > 1
const agg = [
  {
    '$match': {
      'difficulty': {
        '$gt': 1
      }
    }
  }
];
MongoClient.connect(
  'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false',
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(connectErr, client) {
    assert.equal(null, connectErr);
    const coll = client.db('quizManager').collection('questions');
    coll.aggregate(agg, (cmdErr, result) => {
      assert.equal(null, cmdErr);
      console.log(result)
    });
    client.close();
  });