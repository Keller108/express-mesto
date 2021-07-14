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
    .catch(() => res.status(Error500).send({ message: 'Ошибка на сервере.' }));
};

const getUserId = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('IncorrectID'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные.' });
      } else if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: 'Пользователь с таким id не найден.' });
      } else {
        res.status(Error500).send({ message: 'Ошибка на сервере.' });
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
        res.status(Error400).send({ message: 'Переданы некорректные данные.' });
      } else {
        res.status(Error500).send({ message: 'Ошибка на сервере.' });
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
        res.status(Error404).send({ message: 'Пользователь с указанным _id не найден.' });
      } else if (err.name === 'ValidationError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные.' });
      } else {
        res.status(Error500).send({ message: 'Ошибка на сервере.' });
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
        res.status(Error404).send({ message: 'Пользователь с указанным _id не найден.' });
      } else if (err.errors) {
        res.status(Error400).send({ message: 'Переданы некорректные данные.' });
      } else {
        res.status(Error500).send({ message: 'Ошибка на сервере.' });
      }
    });
};

module.exports = {
  getUsers, getUserId, createUser, updateProfile, updateAvatar,
};
