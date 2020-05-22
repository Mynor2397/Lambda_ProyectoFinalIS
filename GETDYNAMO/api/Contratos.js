'use strict';
const AWS = require('aws-sdk');

const moment = require('moment')
AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.post = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const dateString = requestBody.date1;
  const dateString2 = requestBody.date2;

  if (typeof dateString !== 'string' || typeof dateString2 !== 'string') {
    callback(new Error('Revise su data'));
    return;
  }
  //console.log(requestBody);
  var DATA_RESPONSE = [];

  var params = {
      TableName: "lambda-textract-dev",
  };

  let result = dynamoDb.scan(params);
  let data_dynamo = await result.promise();
  for (const key in data_dynamo.Items) {
      let isDateDB = data_dynamo.Items[key].submitedAt
      //console.log(isDateDB);
      let isAfter = moment(isDateDB).isAfter(dateString) || moment(isDateDB).isSame(dateString)
      let isBefore = moment(isDateDB).isBefore(dateString2) || moment(isDateDB).isSame(dateString2)

      if (isAfter && isBefore) {
          DATA_RESPONSE.push(data_dynamo.Items[key])
      } else {
          delete data_dynamo.Items[key]
      }

  }
  //console.log(DATA_RESPONSE);
  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ data: DATA_RESPONSE }),
  })
};