import AWS = require('aws-sdk');
import { DynamoDB } from 'aws-sdk';
import { insertProjectsIntoDynamoDB } from '../lib/services/dynamo-db-service';
import { getGitHubUserRepos, parseGitHubReposIntoProjects } from '../lib/services/github-service';

AWS.config.update({ region: 'us-west-2' });

const apiVersion = { apiVersion: '2012-08-10' };
let ddb = new DynamoDB(apiVersion);

exports.handler = async (event: any) => {
  try {
    if (!ddb) {
      ddb = new DynamoDB(apiVersion);
    }

    const repos = await getGitHubUserRepos();
    const projects = parseGitHubReposIntoProjects(repos);
    const projectCount = await insertProjectsIntoDynamoDB(ddb, projects);

    console.info(`Inserted ${projectCount} projects into DynamoDB`);
  } catch (error) {
    console.error('Error occurred in GitHubRepoInsert Lambda:', JSON.stringify(error, null, 2));
  }
};
