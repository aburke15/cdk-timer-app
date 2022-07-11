const https = require("https");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });
const apiVersion = { apiVersion: "2012-08-10" };
let ddb = new AWS.DynamoDB(apiVersion);

exports.handler = async (event) => {
  try {
    if (!ddb) {
      ddb = new AWS.DynamoDB(apiVersion);
    }

    const repos = await getRequest();
    const { projectCount, projects } = parseGitHubProjects(repos);
    insertProjectsIntoDynamoDB(ddb, projects);

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Inserted ${projectCount} projects into DynamoDB`,
    };
  } catch (error) {
    console.error("Error occurred in GitHubRepoInsert Lambda:", error);
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(error, null, 2),
    };
  }
};

const insertProjectsIntoDynamoDB = (ddb, projects) => {
  projects.forEach((params) => {
    ddb.putItem(params, (err, data) => {
      if (err) {
        console.error("Error occurred in DynamoDB:", err);
      } else {
        console.log("Successfully inserted project into DynamoDB");
      }
    });
  });
};

const parseGitHubProjects = (repos) => {
  let count = 0;
  const projects = [];
  const tableName = process.env.TABLE_NAME;

  repos.forEach((repo) => {
    const repoId = repo.id.toString();
    const project = {
      TableName: tableName,
      Item: {
        id: { S: repoId },
        name: { S: repo.name },
        createdAt: { S: repo.created_at },
        description: {
          S: !repo.description ? "N/A" : repo.description,
        },
        htmlUrl: { S: repo.html_url },
        language: { S: !repo.language ? "N/A" : repo.language },
      },
    };
    projects.push(project);
    count++;
  });

  return {
    projectCount: count,
    projects: projects,
  };
};

const getRequest = () => {
  const url = `https://api.github.com/users/${process.env.GITHUB_USER}/repos?per_page=100`;
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `token ${process.env.GITHUB_PAT}`,
      "User-Agent": "github-repo-insert-lambda",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunck) => {
        data += chunck;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(error));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(error));
    });
  });
};
