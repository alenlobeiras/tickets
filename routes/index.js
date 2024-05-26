// routes/index.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../firebase-config');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'));
});

router.get('/tickets', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '/tickets.html'));
});

router.get('/resumen', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '/resumen.html'));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const userSnapshot = await db.collection('users').doc(username).get();
  if (!userSnapshot.exists) {
    return res.send('Usuario no encontrado');
  }

  const user = userSnapshot.data();
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    req.session.user = { username };
    res.redirect('/tickets');
  } else {
    res.send('Contraseña incorrecta');
  }
});

router.post('/tickets', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No autenticado');
  }

  const { ticketNumber } = req.body;
  const user = req.session.user;

  const ticketDoc = await db.collection('tickets').doc(ticketNumber).get();
  if (ticketDoc.exists) {
    return res.status(400).send('Ticket ya validado');
  } else {
    await db.collection('tickets').doc(ticketNumber).set({
      number: ticketNumber,
      user: user.username,
      date: new Date()
    });
    res.status(200).send('Ticket validado correctamente');
  }
});

router.get('/api/tickets', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No autenticado');
  }

  const user = req.session.user;
  const ticketsSnapshot = await db.collection('tickets').where('user', '==', user.username).get();
  const tickets = ticketsSnapshot.docs.map(doc => doc.data());
  res.json(tickets);
});

router.get('/api/resumen', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No autenticado');
  }

  const user = req.session.user;
  const ticketsSnapshot = await db.collection('tickets').where('user', '==', user.username).get();
  const tickets = ticketsSnapshot.docs.map(doc => doc.data());

  const resumen = {};
  tickets.forEach(ticket => {
    const date = ticket.date.toDate();
    const month = date.getMonth() + 1;
    const week = Math.ceil(date.getDate() / 7);

    if (!resumen[month]) resumen[month] = {};
    if (!resumen[month][week]) resumen[month][week] = [];

    resumen[month][week].push(ticket);
  });

  res.json(resumen);
});

module.exports = router;
