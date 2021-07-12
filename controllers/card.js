const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

const postCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(200).send({ data: card }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

const removeCard = (req, res) => {
  const cardId = req.card._id;

  Card.findById(req.params.cardId)
    .then((card) => {
      card.remove();
      res.status(200).send({ message: `Карточка с _id: ${cardId} успешно удалена.` })
        .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
    });
};

module.exports = { getCards, postCard, removeCard };
