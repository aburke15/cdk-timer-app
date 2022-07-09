exports.handler = async (event, context) => {
  try {
    // pull secrets from env

    //

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: "You are reaching the lambda function!",
    };
  } catch (error) {
    console.error("Error occurred in GitHubTimer Lambda: ", error);
  }
};
