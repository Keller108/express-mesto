const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const { errorsHandling } = require('./middlewares/errors');
const NotFound = require('./errors/NotFound');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(35),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(35),
  }),
}), login);

app.use(auth);

app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

// eslint-disable-next-line no-unused-vars
app.use('*', (req, res) => {
  throw new NotFound('Ресурс не найден');
});

app.use(errorLogger);

app.use(errors());
app.use(errorsHandling);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Слушаем порт ${PORT}`);
});
