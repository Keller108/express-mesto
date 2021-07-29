/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
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
      throw new NotFound('Пользователя с таким Id не существует');
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Некорректный Id');
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
        const userDoc = user._doc;
        delete userDoc.password;
        res.status(200).send(user);
      })
      .catch((err) => {
        console.log(err.name);
        if (err.name === 'ValidationError') {
          console.log(err.name);
          throw new BadRequest('Ошибка при создании пользователя');
        } else next(err);
      }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Некорректные данные');
      } else next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .orFail(() => {
      throw new NotFound('Пользователь не найден');
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequest('Данные пользователя не корректны');
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  User.findByIdAndUpdate(req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    })
    .orFail(() => {
      throw new NotFound('Пользователя с таким id нет.');
    })
    .then((user) => { res.status(200).send(user); })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Ссылка на аватар некорректна');
      } else if (err.name === 'CastError') {
        throw new BadRequest('Id не корректен');
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new NotFound('Указанные email или пароль не найдены');
  } else {
    User.findOne({ email }).select('+password')
      .orFail(() => {
        throw new BadRequest('Некорректный email');
      })
      .then((user) => {
        bcrypt.compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              throw new BadRequest('Указан неправильный email или пароль.');
            } else {
              const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
              res.status(200).send({ token });
            }
          });
      })
      .catch((err) => {
        throw new Unauthorized(`Пользователь не авторизован + ${err.message}`);
      })
      .catch(next);
  }
};

module.exports = {
  getUsers, getUserById, createUser, updateProfile, updateAvatar, login,
};
