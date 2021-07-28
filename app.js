const express = require('express');
const mongoose = require('mongoose');

const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const { errors } = require('./middlewares/errors');

const { PORT = 3000 } = process.env;

const Error404 = 404;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.post('/signup', createUser);
app.post('/signin', login);

app.use(auth);

app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.use('*', (req, res) => {
  res.status(Error404).send({ message: 'Ресурс не найден.' });
});

app.use(errors);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Слушаем порт ${PORT}`);
});
