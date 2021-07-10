const User = require('../models/user');

const getUsers = (req, res, next) => {
    User.find({})
    .then((users) => res.send(users))
    .catch(next)
}

const getUserId = (req, res, next) => {
  User.findById(req.params.id)
    .then(({ _id }) => {
      User.findById(_id)
        .then((user) => res.send(user))
        .catch((err) => console.log(err))
        .catch(next);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
}

module.exports = { getUsers, getUserId, createUser };