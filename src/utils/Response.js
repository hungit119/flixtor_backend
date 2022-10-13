class Response {
  response(success, message, data) {
    return {
      success,
      message,
      data,
    };
  }
}
module.exports = new Response();
