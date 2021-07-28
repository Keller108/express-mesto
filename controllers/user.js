/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const ConflictRequest = require('../errors/ConflictRequest');
const Unauthorized = require('../errors/Unauthorized');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFound('Пользователя с таким Id не существует')
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Некорректный Id')
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(Error400).send({ message: err.message });
        } else if (err.name === 'MongoError' && err.code === 11000) {
          res.status(Error409).send({ message: err.message });
        } else {
          res.status(Error500).send({ message: err.message });
        }
      }))
    .catch(next);
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

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401).send({ message: 'Указаные email или пароль отсутствуют.' });
  } else {
    User.findOne({ email }).select('+password')
      .orFail(new Error('IncorrectEmail'))
      .then((user) => {
        bcrypt.compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              res.status(Error401).send({ message: 'Указан неправильный email или пароль.' });
            } else {
              const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
              res.status(200).send({ token });
            }
          });
      })
      .catch((err) => {
        if (err.name === 'IncorrectEmail') {
          res.status(Error401).send({ message: 'Указан неправильный email или пароль.' });
        } else {
          res.status(Error500).send({ message: 'Ошибка на сервере.' });
        }
      });
  }
};

module.exports = {
  getUsers, getUserById, createUser, updateProfile, updateAvatar, login,
};
