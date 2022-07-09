exports.handler = async (event, context, callback) => {
  try {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: "Reading from lambda func",
    };
  } catch (error) {
    console.error("Some string:", error);
  }
};
