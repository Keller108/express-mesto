/* eslint-disable no-shadow */
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
      throw new Error('Карточка с таким id не найдена!');
    })
    .then((card) => {
      console.log(card);
      if (card.owner._id.toString() === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .then((userCard) => {
            res.status(200).send(userCard);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              throw new BadRequest('Неправильный id');
            }
          })
          .catch(next);
      } else {
        throw new Forbidden('Недостаточно прав для удаления карточки');
      }
      return res.status(200).send({ message: 'Карточка удалена' });
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
      throw new NotFound('Карточка с таким id не найдена!');
    })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Ошибка валидации данных');
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
      throw new NotFound('Карточка с таким id не найдена!');
    })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest('Неправильный id');
      }
    })
    .catch(next);
};

module.exports = {
  getCards, postCard, removeCard, likeCard, dislikeCard,
};
