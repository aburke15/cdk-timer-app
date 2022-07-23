import { APIGatewayEvent } from 'aws-lambda';
import AWS = require('aws-sdk');
import { getProjectsFromDynamoDB } from '../lib/services/dynamo-db-service';

AWS.config.update({ region: 'us-west-2' });
const apiVersion = { apiVersion: '2012-08-10' };

let ddb = new AWS.DynamoDB(apiVersion);
let lambda = new AWS.Lambda();

exports.handler = async (event: APIGatewayEvent) => {
  if (!ddb) {
    ddb = new AWS.DynamoDB(apiVersion);
  }
  if (!lambda) {
    lambda = new AWS.Lambda();
  }

  try {
    const tableName: string = process.env.TABLE_NAME!;
    const functionName: string = process.env.DOWNSTREAM_FUNCTION_NAME!;
    const data = await getProjectsFromDynamoDB(ddb);

    const items = data.Items?.map((item) => {
      return ddb
        .deleteItem({
          TableName: tableName,
          Key: {
            id: {
              S: item.id.S,
            },
            createdAt: {
              S: item.createdAt.S,
            },
          },
        })
        .promise();
    });

    await Promise.all(items!);

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
