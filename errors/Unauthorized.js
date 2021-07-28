class Unauthorized extends Error {
  super(message) {
    constructor(message);
    this.statusCode = 401;
  }
}

module.exports = Unauthorized;
