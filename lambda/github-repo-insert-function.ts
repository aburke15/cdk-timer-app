import AWS = require('aws-sdk');
import { DynamoDB } from 'aws-sdk';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';
import https = require('https');
import { GitHubProject } from '../lib/utils/types';

AWS.config.update({ region: 'us-west-2' });

const apiVersion = { apiVersion: '2012-08-10' };
let ddb = new DynamoDB(apiVersion);

exports.handler = async (event: any) => {
  try {
    if (!ddb) {
      ddb = new DynamoDB(apiVersion);
    }

    const repos = await getRequest();
    const projects = parseGitHubProjects(repos);
    const projectCount = await insertProjectsIntoDynamoDB(ddb, projects);

    console.info(`Inserted ${projectCount} projects into DynamoDB`);
  } catch (error) {
    console.error('Error occurred in GitHubRepoInsert Lambda:', JSON.stringify(error, null, 2));
  }
};

const insertProjectsIntoDynamoDB = async (ddb: DynamoDB, projects: GitHubProject[]): Promise<number> => {
  let count = 0;
  const tableName = process.env.TABLE_NAME ?? 'GitHubRepoTable';

  const items = projects.map((project) => {
    count++;
    return ddb
      .putItem({
        TableName: tableName,
        Item: {
          id: { S: project.id },
          name: { S: project.name },
          createdAt: { S: project.createdAt },
          description: { S: project.description },
          htmlUrl: { S: project.htmlUrl },
          language: { S: project.language },
        },
      })
      .promise();
  });

  try {
    await Promise.all(items);
  } catch (error) {
    console.error('Error inserting into DynamoDB:', error);
  }

  return count;
};

const parseGitHubProjects = (repos: any[]): GitHubProject[] => {
  const projects: GitHubProject[] = [];
  repos.forEach((repo) => {
    const repoId = repo.id.toString();
    const project: GitHubProject = {
      id: repoId,
      name: repo.name,
      createdAt: repo.created_at,
      description: repo.description ?? 'N/A',
      htmlUrl: repo.html_url,
      language: repo.language ?? 'N/A',
    };
    projects.push(project);
  });

  return projects;
};

const getRequest = (): Promise<any[]> => {
  const url = `https://api.github.com/users/${process.env.GITHUB_USER}/repos?per_page=100`;
  const options: https.RequestOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${process.env.GITHUB_PAT}`,
      'User-Agent': 'github-repo-insert-lambda',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunck) => {
        data += chunck;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error: any) {
          reject(new Error(error));
        }
      });
    });

    req.on('error', (error: any) => {
      reject(new Error(error));
    });
  });
};
