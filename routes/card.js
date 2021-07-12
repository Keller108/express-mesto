const router = require('express').Router();
const { getCards, postCard, removeCard } = require('../controllers/card');

router.get('/cards', getCards);

router.post('/cards', postCard);

router.delete('cards/:cardId', removeCard);

module.exports = router;
