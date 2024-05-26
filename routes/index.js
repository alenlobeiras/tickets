// routes/index.js
const express = require('express');
const router = express.Router();
const db = require('../firebase-config');

// Middleware para verificar la autenticación del usuario
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Página de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Aquí iría la lógica para validar las credenciales
  // Por simplicidad, aceptamos cualquier usuario
  req.session.user = { username };
  res.redirect('/tickets');
});

// Página de tickets
router.get('/tickets', isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ticketsSnapshot = await db.collection('tickets').where('user', '==', user.username).get();
  const tickets = ticketsSnapshot.docs.map(doc => doc.data());
  res.render('tickets', { tickets });
});

router.post('/tickets', isAuthenticated, async (req, res) => {
  const { ticketNumber } = req.body;
  const user = req.session.user;

  const ticketDoc = await db.collection('tickets').doc(ticketNumber).get();
  if (ticketDoc.exists) {
    res.status(400).send('Ticket ya validado');
  } else {
    await db.collection('tickets').doc(ticketNumber).set({
      number: ticketNumber,
      user: user.username,
      date: new Date()
    });
    res.status(200).send('Ticket validado correctamente');
  }
});

// Resumen de tickets
router.get('/resumen', isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ticketsSnapshot = await db.collection('tickets').where('user', '==', user.username).get();
  const tickets = ticketsSnapshot.docs.map(doc => doc.data());

  // Agrupamos los tickets por mes y semana
  const resumen = {};
  tickets.forEach(ticket => {
    const date = ticket.date.toDate();
    const month = date.getMonth() + 1;
    const week = Math.ceil(date.getDate() / 7);

    if (!resumen[month]) resumen[month] = {};
    if (!resumen[month][week]) resumen[month][week] = [];

    resumen[month][week].push(ticket);
  });

  res.render('resumen', { resumen });
});

module.exports = router;
