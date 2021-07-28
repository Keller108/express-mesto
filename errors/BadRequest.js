class BadRequest extends Error {
  super(message) {
    constructor(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequest;
