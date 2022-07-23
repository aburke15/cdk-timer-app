import AWS = require('aws-sdk');
import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';
import { getProjectsFromDynamoDB, parseGitHubProjectsFromDynamoDB } from '../lib/services/dynamo-db-service';
import { isAllowedOrigin } from '../lib/services/http-service';

AWS.config.update({ region: 'us-west-2' });

const apiVersion = { apiVersion: '2012-08-10' };
const defaultOrigin = 'https://www.aburke.tech';

let ddb = new DynamoDB(apiVersion);

exports.handler = async (event: APIGatewayEvent) => {
  const origin = event.headers.origin ?? 'N/A';
  let goodOrigin = isAllowedOrigin(origin);

  console.info('Origin', origin);

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers':
        'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id',
      'Access-Control-Expose-Headers': 'x-my-header-out',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Origin': goodOrigin ? origin : defaultOrigin,
    } as const,
    body: {},
  };

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
