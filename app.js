// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
