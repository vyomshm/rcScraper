const util = require("util");

function generateResBody(statusCode, result) {
  return {
    status: statusCode,
    data: util.inspect(result)
  };
}



function generateJsonBody(statusCode, result) {
  return {
    status: statusCode,
    data: result
  }
}

module.exports = {
  generateResBody,
  generateJsonBody
};