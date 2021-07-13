const User = require('../models/user');

const Error400 = 400;
const Error404 = 404;
const Error500 = 500;

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(Error500).send({ message: 'Произошла ошибка' }));
};

const getUserId = (req, res) => {
  User.findById(req.params.id)
    .orFail(new Error('IncorrectID'))
    .then(({ _id }) => {
      User.findById(_id)
        .then((user) => res.send(user))
        .catch((err) => {
          if (err.name === 'CastError') {
            res.status(Error400).send({ message: 'Переданы некорректные данные'});
          } else if (err.message === 'IncorrectID') {
            res.status(Error404).send({ message: 'Пользователь по указанному _id не найден.'});
          } else {
            res.status(Error500).send({ message: 'На сервере произошла ошибка'});
          }
        });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные'});
      }
    });
};

module.exports = { getUsers, getUserId, createUser };
