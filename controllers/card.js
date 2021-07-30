/* eslint-disable no-new */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const Card = require('../models/card');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

const postCard = (req, res, next) => {
  const { name, link } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest('Вы не заполнили обязательные поля или данные не верны');
      }
    })
    .catch(next);
};

const removeCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new Error('IncorrectID');
    })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        card.remove();
        res.status(200).send({ message: 'Карточка успешно удалена.' });
      } else {
        throw new Forbidden('Недостаточно прав для удаления карточки');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Карточка с указанным id не найдена.');
      } else if (err.message === 'IncorrectID') {
        throw new NotFound('Карточка с указанным id не найдена.');
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('IncorrectCardID');
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные для постановки лайка.');
      } else if (err.message === 'IncorrectCardID') {
        throw new NotFound(`Карточка с указанным _id: ${req.params.cardId} не найдена.`);
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('IncorrectCardID');
    })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Переданы некорректные данные для снятия лайка.');
      } else if (err.message === 'IncorrectCardID') {
        throw new NotFound(`Карточка с указанным _id: ${req.params.cardId} не найдена.`);
      }
    })
    .catch(next);
};

module.exports = {
  getCards, postCard, removeCard, likeCard, dislikeCard,
};
