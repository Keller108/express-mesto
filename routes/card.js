const router = require('express').Router();
const {
  getCards, postCard, removeCard, likeCard, dislikeCard,
} = require('../controllers/card');

router.get('/cards', getCards);
router.post('/cards', postCard);
router.delete('/cards/:cardId', removeCard);
router.put('/cards/:cardId/likes', likeCard);
router.delete('/cards/:cardId/likes', dislikeCard);

module.exports = router;
