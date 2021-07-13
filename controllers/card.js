const Card = require('../models/card');

const Error400 = 400;
const Error404 = 404;
const Error500 = 500;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const postCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) =>  res.status(Error500).send({ message: 'На сервере произошла ошибка'});
};

const removeCard = (req, res) => {
  Card.findById(req.params.id)
  .orFail(new Error('IncorrectID'))
    .then((card) => {
      if (card.owner._id.toString() === req.user._id) {
        Card.findByIdAndRemove(req.params.id)
          .then((card) => {
            res.send(card);
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              res.status(Error400).send({ message: 'Переданы некорректные данные'});
            } else if (err.message === 'IncorrectID') {
              res.status(Error404).send({ message: 'Карточка по указанному _id не найдена.'});
            } else {
              res.status(Error500).send({ message: 'На сервере произошла ошибка'});
            }
          });
      }
      return res.status(200).send({ message: 'Карточка удалена' });
    })
    .catch((err) => res.status(Error500).send({ message: 'На сервере произошла ошибка' }));
};

const likeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)

const dislikeCard = (req, res) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
);

module.exports = {
  getCards, postCard, removeCard, likeCard, dislikeCard,
};
