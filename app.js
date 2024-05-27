const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { db, auth } = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'tu_secreto_aqui',
  resave: false,
  saveUninitialized: true
}));

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Exporta la app para que Vercel pueda usarla
