import AWS = require('aws-sdk');
import { DynamoDB } from 'aws-sdk';
import { ScanInput } from 'aws-sdk/clients/dynamodb';
import { GitHubProject } from '../lib/utils/types';

AWS.config.update({ region: 'us-west-2' });

const apiVersion = { apiVersion: '2012-08-10' };
let ddb = new DynamoDB(apiVersion);

exports.handler = async (event: any) => {
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers':
        'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id',
      'Access-Control-Expose-Headers': 'x-my-header-out',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Origin': ['https://www.aburke.tech', 'http://localhost:3000'],
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

    const projects = parseGitHubProjects(data?.Items);
    response.body = JSON.stringify(projects, null, 2);

    return response;
  } catch (error) {
    console.error('Error occurred in GitHubRepoRead Lambda:', error);
    response.statusCode = 400;
    response.body = JSON.stringify(error, null, 2);

    return response;
  }
};

const parseGitHubProjects = (itemList?: DynamoDB.ItemList): GitHubProject[] => {
  const projects: GitHubProject[] = [];
  if (itemList === undefined) {
    return projects;
  }

  itemList.forEach((item) => {
    const project: GitHubProject = {
      id: item.id.S,
      name: item.name.S,
      createdAt: item.createdAt.S,
      description: item.description.S,
      htmlUrl: item.htmlUrl.S,
      language: item.language.S,
    };

    projects.push(project);
  });

  return projects;
};

const getProjectsFromDynamoDB = (ddb: DynamoDB) => {
  const tableName = process.env.TABLE_NAME ?? 'GitHubRepoTable';
  const params: ScanInput = {
    TableName: tableName,
  };

  return ddb.scan(params).promise();
};
