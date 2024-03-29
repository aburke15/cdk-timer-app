import { DynamoDB } from 'aws-sdk';
import { ScanInput } from 'aws-sdk/clients/dynamodb';
import { GitHubProject } from '../utils/types';

export const insertProjectsIntoDynamoDB = async (ddb: DynamoDB, projects: GitHubProject[]): Promise<number> => {
  let count = 0;
  const tableName = process.env.TABLE_NAME!;

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

export const getProjectsFromDynamoDB = (ddb: DynamoDB) => {
  const tableName: string = process.env.TABLE_NAME!;
  const params: ScanInput = {
    TableName: tableName,
  };

  return ddb.scan(params).promise();
};

export const deleteProjectsFromDynamoDB = async (ddb: DynamoDB, data: DynamoDB.ScanOutput): Promise<void> => {
  const tableName: string = process.env.TABLE_NAME!;
  const items = data.Items?.map((item) => {
    return ddb
      .deleteItem({
        TableName: tableName,
        Key: {
          id: { S: item.id.S },
          createdAt: { S: item.createdAt.S },
        },
      })
      .promise();
  });

  try {
    await Promise.all(items!);
  } catch (error) {
    console.error(error);
  }
};

export const parseGitHubProjectsFromDynamoDB = (itemList?: DynamoDB.ItemList): GitHubProject[] => {
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
