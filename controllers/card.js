/* eslint-disable no-constant-condition */
/* eslint-disable no-cond-assign */
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
  const userCard = req.params.cardId;

  Card.findById(userCard)
    .orFail(() => {
      throw new NotFound('Not Found');
    })
    .then((card) => {
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
          .catch((err) => next(err));
      } else {
        throw new Forbidden('Недостаточно прав для удаления карточки');
      }
      return res.status(200).send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        throw new NotFound('Такой карточки не существует!');
      } else if (err.name === 'CastError') {
        throw new NotFound('Карточка не найдена');
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
      throw new Error('Not Found');
    })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      console.log(err.name);
      if (err.name === 'Error') {
        throw new NotFound('Карточка не найдена');
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
      throw new Error('Not Found');
    })
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      console.log(err.name);
      if (err.name === 'Error') {
        throw new NotFound('Карточка не найдена');
      }
    })
    .catch(next);
};

module.exports = {
  getCards, postCard, removeCard, likeCard, dislikeCard,
};
