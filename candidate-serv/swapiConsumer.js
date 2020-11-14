'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const swapi = require('swapi-node');


module.exports.getFromDynamo = (event, context, callback) => {
    var params = {
        TableName: process.env.CANDIDATE_TABLE,
        ProjectionExpression: "nombre"
    };

    console.log("Scanning Candidate table.");
    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    candidates: data.Items
                })
            });
        }

    };

    dynamoDb.scan(params, onScan);

};


module.exports.getSwapi = (event, context, callback) => {

  submitObj(getObj())
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted`,
          candidateId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit`
        })
      })
    });
};


const submitObj = starWarsObject => {
  console.log('Submitting starWarsObject');
  const starWarsObjectInfo = {
    TableName: process.env.CANDIDATE_TABLE,
    Item: starWarsObject,
  };
  return dynamoDb.put(starWarsObjectInfo).promise()
    .then(res => starWarsObject);
};

const getObj = () => {
  swapi.get('https://swapi.dev/api/people/').then((result) => {
    console.log(result);
    return result.nextPage();
  }).then((result) => {
      console.log(result);
      return result.previousPage();
  }).then((result) => {
      console.log(result);
      const arrayInSpanish = []; //Add the keys in spanish
      const arrayInEnglish = []; //Get the actual keys in english
      let starWarsObject = renameKey(result, arrayInEnglish, arrayInSpanish)
      return starWarsObject;
  }).catch((err) => {
      console.log(err);
  });
};

const renameKey =  ( obj, oldKey, newKey ) => {
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
  return obj;
}