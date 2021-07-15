/* eslint-disable no-underscore-dangle */
const User = require('../models/user');

const Error400 = 400;
const Error404 = 404;
const Error500 = 500;

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => res.status(Error500).send({ message: err.message }));
};

const getUserId = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('IncorrectID'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(Error400).send({ message: err.message });
      } else if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(Error400).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .orFail(new Error('IncorrectID'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: err.message });
      } else if (err.name === 'ValidationError') {
        res.status(Error400).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  User.findByIdAndUpdate(req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .orFail(new Error('IncorrectID'))
    .then((user) => { res.status(200).send(user); })
    .catch((err) => {
      if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: err.message });
      } else if (err.errors) {
        res.status(Error400).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
      }
    });
};

module.exports = {
  getUsers, getUserId, createUser, updateProfile, updateAvatar,
};
