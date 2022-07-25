import { APIGatewayEvent } from 'aws-lambda';
import AWS = require('aws-sdk');
import { deleteProjectsFromDynamoDB, getProjectsFromDynamoDB } from '../lib/services/dynamo-db-service';

AWS.config.update({ region: 'us-west-2' });
const apiVersion = { apiVersion: '2012-08-10' };

let ddb = new AWS.DynamoDB(apiVersion);
let lambda = new AWS.Lambda();

exports.handler = async (event: APIGatewayEvent) => {
  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB(apiVersion);
    }
    if (!lambda) {
      lambda = new AWS.Lambda();
    }

    const functionName: string = process.env.DOWNSTREAM_FUNCTION_NAME!;

    const data = await getProjectsFromDynamoDB(ddb);
    await deleteProjectsFromDynamoDB(ddb, data);

    await lambda
      .invoke({
        FunctionName: functionName,
        Payload: JSON.stringify(event, null, 2),
      })
      .promise();
  } catch (error) {
    console.error(error);
  }
};
