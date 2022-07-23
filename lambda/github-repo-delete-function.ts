import { APIGatewayEvent } from 'aws-lambda';
import AWS = require('aws-sdk');

AWS.config.update({ region: 'us-west-2' });
const apiVersion = { apiVersion: '2012-08-10' };

let ddb = new AWS.DynamoDB(apiVersion);
let lambda = new AWS.Lambda();

exports.handler = async (event: APIGatewayEvent) => {
  if (!ddb) {
    ddb = new AWS.DynamoDB(apiVersion);
  }
  if (!lambda) {
    lambda = new AWS.Lambda();
  }

  try {
    // delete all records from ddb table
    // call the insert function
  } catch (error) {}
};
