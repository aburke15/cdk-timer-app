import AWS = require('aws-sdk');
import { APIGatewayEvent } from 'aws-lambda';
import { getProjectsFromDynamoDB, parseGitHubProjectsFromDynamoDB } from '../lib/services/dynamo-db-service';
import { apiVersion, region } from '../lib/utils/config';
import { FunctionResponse } from '../lib/models/responses';

AWS.config.update(region);

let ddb = new AWS.DynamoDB(apiVersion);

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
} as const;

const response: FunctionResponse<string> = {
  statusCode: 200,
  headers: headers,
  body: '',
};

exports.handler = async (event: APIGatewayEvent) => {
  console.info(JSON.stringify(event, null, 2));

  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB(apiVersion);
    }

    const data = await getProjectsFromDynamoDB(ddb);
    const responseStatusCode = data.$response.httpResponse.statusCode;

    if (responseStatusCode < 200 || responseStatusCode > 299) {
      response.statusCode = responseStatusCode;
      response.body = JSON.stringify(data.Items, null, 2);
    }

    const projects = parseGitHubProjectsFromDynamoDB(data?.Items);
    response.body = JSON.stringify(projects, null, 2);

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
