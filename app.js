const express = require('express');
const app = express();

const { PORT } = process.env;

app.listen(PORT, () => {
    console.log('App is listening on port ${PORT}')
})