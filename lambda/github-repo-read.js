const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });
const apiVersion = { apiVersion: "2012-08-10" };
let ddb = new AWS.DynamoDB(apiVersion);

exports.handler = async (event) => {
  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB(apiVersion);
    }

    const data = await getProjectsFromDynamoDB(ddb);

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data.Items, null, 2),
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

const getProjectsFromDynamoDB = (ddb) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    ProjectionExpression:
      "id, name, createdAt, description, htmlUrl, language",
  };

  return ddb.scan(params).promise();
};
