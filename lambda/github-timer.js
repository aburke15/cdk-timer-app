exports.handler = async function (event) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: "You are reaching the lambda function!",
  };
};
