/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const Error400 = 400;
const Error401 = 401;
const Error404 = 404;
const Error409 = 409;
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
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(Error400).send({ message: err.message });
        } else if (err.name === 'MongoError') {
          res.status(Error409).send({ message: err.message });
        } else {
          res.status(Error500).send({ message: err.message });
        }
      })));
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
    res.status(401).send({ message: 'Указаные email или пароль отсутствуют.'})
  } else {
      User.findOne({ email })
      .orFail(new Error('IncorrectEmail'))
      .then((user) => {
          bcrypt.compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              res.status(Error401).send({ message: 'Указан неправильный email или пароль.'})
            } else {
              const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expriresIn: '7d' });
              res.status(200).send({ token });
            }
          })
      })
      .catch((err) => {
        if (err.name === 'IncorrectEmail') {
          res.status(Error401).send({ message: 'Указан неправильный email или пароль.'})
        } else {
          res.status(Error500).send({ message: 'Ошибка на сервере.' });
        }
      });
    };
};

module.exports = {
  getUsers, getUserId, createUser, updateProfile, updateAvatar, login
};
