/* eslint-disable no-underscore-dangle */
const Card = require('../models/card');

const Error400 = 400;
const Error404 = 404;
const Error500 = 500;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() => res.status(Error500).send({ message: 'Ошибка на сервере.' }));
};

const postCard = (req, res) => {
  const { name, link } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные.' });
      } else {
        res.status(Error500).send({ message: 'Ошибка на сервере.' });
      }
    });
};

const removeCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      card.remove();
      res.status(200).send({ message: `Карточка c _id: ${card._id} успешно удалена.` });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные.' });
      } else {
        res.status(Error404).send({ message: 'Карточка с таким id не найдена.' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('IncorrectID'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: 'Карточка с таким id не найдена.' });
      } else {
        res.status(Error500).send({ message: 'Ошибка на сервере.' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('IncorrectID'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(Error400).send({ message: 'Переданы некорректные данные для снятия лайка.' });
      } else if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: 'Карточка с таким id не найдена.' });
      } else {
        res.status(Error500).send({ message: 'На сервере произошла ошибка.' });
      }
    });
};

module.exports = {
  getCards, postCard, removeCard, likeCard, dislikeCard,
};
