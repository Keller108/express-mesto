class BadRequest extends Error {
  super(message) {
    constructor(message);
    this.statusCode = 500;
  }
}

module.exports = BadRequest;
