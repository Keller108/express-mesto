/* eslint-disable linebreak-style */
const mongoose = require('mongoose');
// const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlegth: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlegth: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    minlength: 1,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // validate: {
    //   validator: (v) => isEmail(v),
    //   message: 'Неправильный формат почты.',
    // },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

module.exports = mongoose.model('user', userSchema);
