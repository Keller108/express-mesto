const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use('/', require('./routes/user'));

app.use((req, res, next) => {
  req.user = {
    _id: '60eacbf48473e131d0c94119',
  };

  next();
});

app.listen(PORT, () => {
  console.log(`Слушаем порт ${PORT}`);
});
