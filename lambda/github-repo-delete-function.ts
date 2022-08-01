import AWS = require('aws-sdk');
import { APIGatewayEvent } from 'aws-lambda';
import { deleteProjectsFromDynamoDB, getProjectsFromDynamoDB } from '../lib/services/dynamo-db-service';
import { apiVersion, region } from '../lib/utils/config';

AWS.config.update(region);

let ddb = new AWS.DynamoDB(apiVersion);
let lambda = new AWS.Lambda();

const functionName: string = process.env.DOWNSTREAM_FUNCTION_NAME as string;

exports.handler = async (event: APIGatewayEvent) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB(apiVersion);
    }
    if (!lambda) {
      lambda = new AWS.Lambda();
    }

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
    throw error;
  }
};
