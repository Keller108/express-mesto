/* eslint-disable no-underscore-dangle */
const Card = require('../models/card');

const Error400 = 400;
const Error404 = 404;
const Error500 = 500;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => res.status(Error500).send({ message: err.message }));
};

const postCard = (req, res) => {
  const { name, link } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(Error400).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
      }
    });
};

const removeCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new Error('Карточка с таким id не найдена!');
    })
    .then((card) => {
      if (card.owner._id.toString() === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .then((card) => {
            res.send(card);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              throw new Error('Неправильный id');
            }
          })
          .catch(next);
      } else {
        throw new Error('Недостаточно прав для удаления карточки');
      }
      return res.status(200).send({ message: 'Карточка удалена' });
    })
    .catch(next);
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
        res.status(Error400).send({ message: err.message });
      } else if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
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
        res.status(Error400).send({ message: err.message });
      } else if (err.message === 'IncorrectID') {
        res.status(Error404).send({ message: err.message });
      } else {
        res.status(Error500).send({ message: err.message });
      }
    });
};

module.exports = {
  getCards, postCard, removeCard, likeCard, dislikeCard,
};
