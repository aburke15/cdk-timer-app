const { Octokit } = require("@octokit/rest");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

exports.handler = async (event, context, callback) => {
  try {
    const repos = await octokit.request("GET /users/{user}/repos", {
      user: process.env.GITHUB_USER,
    });

    console.log(repos);

    return {
      statusCode: 200,
      headers: { "Content-Type": "aplication/json" },
      body: gitHubRepos,
    };
  } catch (error) {
    console.error("Error occurred in GitHubRepoInsert Lambda: ", error);
  }
};
