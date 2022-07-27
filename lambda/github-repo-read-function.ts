import AWS = require('aws-sdk');
import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';
import { getProjectsFromDynamoDB, parseGitHubProjectsFromDynamoDB } from '../lib/services/dynamo-db-service';

AWS.config.update({ region: 'us-west-2' });

const apiVersion = { apiVersion: '2012-08-10' };

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
} as const;

const response = {
  statusCode: 200,
  headers: headers,
  body: {},
};

let ddb = new DynamoDB(apiVersion);

exports.handler = async (event: APIGatewayEvent) => {
  try {
    if (!ddb) {
      ddb = new DynamoDB(apiVersion);
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
    console.error('Error occurred in GitHubRepoRead Lambda:', error);
    response.statusCode = 400;
    response.body = JSON.stringify(error, null, 2);

    return response;
  }
};
