const express = require('express');
const mongoose = require('mongoose');

const app = express();
const { PORT = 27017 } = process;

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  seFindAndModify: false,
});

app.listen(PORT)