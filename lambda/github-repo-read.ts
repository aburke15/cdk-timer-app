import AWS = require("aws-sdk");
import { DynamoDB } from "aws-sdk";
import { ScanInput } from "aws-sdk/clients/dynamodb";

AWS.config.update({ region: "us-west-2" });

const apiVersion = { apiVersion: "2012-08-10" };
let ddb = new DynamoDB(apiVersion);

exports.handler = async (event: any) => {
  try {
    if (!ddb) {
      ddb = new DynamoDB(apiVersion);
    }

    //const data = await getProjectsFromDynamoDB(ddb);

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ message: "hello, world!" }, null, 2),
    };
  } catch (error) {
    console.error("Error occurred in GitHubRepoRead Lambda:", error);

    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(error, null, 2),
    };
  }
};

const getProjectsFromDynamoDB = (ddb: DynamoDB) => {
  const tableName = process.env.TABLE_NAME ?? "GitHubRepoTable";
  const params: ScanInput = {
    TableName: tableName,
    ProjectionExpression:
      "id, name, createdAt, description, htmlUrl, language",
  };

  return ddb.scan(params).promise();
};
