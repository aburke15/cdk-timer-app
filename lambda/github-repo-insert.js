const https = require("https");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

let ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

exports.handler = async (event, context, callback) => {
  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
    }

    const projectCount = insertProjectsIntoDynamoDB(ddb);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Inserted ${projectCount} projects into DynamoDB`,
    };
  } catch (error) {
    console.error("Error occurred in GitHubRepoInsert Lambda: ", error);
  }
};

const insertProjectsIntoDynamoDB = (ddb) => {
  let count = 0;
  const projects = [];
  const tableName = process.env.TABLE_NAME;

  getReposFromGitHub().then((repos) => {
    repos.foreach((repo) => {
      const project = {
        TableName: tableName,
        Item: {
          id: { N: repo.id },
          name: { S: repo.name },
          createdAt: { S: repo.created_at },
          description: { S: repo.description },
          htmlUrl: { S: repo.html_url },
          language: { S: repo.language },
        },
      };
      projects.push(project);
    });

    projects.forEach((project) => {
      if (count === 0) {
        console.log(project);
      }
      count++;
      ddb.putItem(project, (error, data) => {
        if (error) {
          console.error("Error:", error);
        } else {
          console.log("Success:", data);
        }
      });
    });
  });

  return count;
};

const getReposFromGitHub = () => {
  const username = process.env.GITHUB_USER;
  const pat = process.env.GITHUB_PAT;
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pat}`,
      "User-Agent": "request",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://api.github.com/users/${username}/repos`,
      options,
      (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(
            new Error(
              `Failed to load page, status code: ${res.statusCode}. Message: ${res.statusMessage}`
            )
          );
        }

        let data = "";
        res.on("data", (cunck) => {
          data += cunck;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            console.error("Error parsing JSON: ", error);
            reject(error);
          }
        });
      }
    );

    req.on("error", (error) => {
      console.error("Error occurred in GitHubRepoInsert Lambda: ", error);
      reject(error);
    });

    req.end();
  });
};
