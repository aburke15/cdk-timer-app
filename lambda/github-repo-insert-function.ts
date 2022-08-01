import * as AWS from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';
import { insertProjectsIntoDynamoDB } from '../lib/services/dynamo-db-service';
import { getGitHubUserRepos, parseGitHubReposIntoProjects } from '../lib/services/github-service';
import { apiVersion, region } from '../lib/utils/config';

AWS.config.update(region);
let ddb = new AWS.DynamoDB(apiVersion);

exports.handler = async (event: APIGatewayEvent) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB(apiVersion);
    }

    const repos = await getGitHubUserRepos();
    const projects = parseGitHubReposIntoProjects(repos);
    const projectCount = await insertProjectsIntoDynamoDB(ddb, projects);

    console.info(`Inserted ${projectCount} projects into DynamoDB`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
