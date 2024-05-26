// routes/index.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const router = express.Router();
const { db, auth } = require('../firebase-config');

// Middleware para verificar la autenticación del usuario
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/');
  }
}

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/tickets', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/tickets.html'));
});

router.get('/resumen', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/resumen.html'));
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userSnapshot = await db.collection('users').doc(username).get();
    if (!userSnapshot.exists) {
      return res.send('Usuario no encontrado');
    }

    const user = userSnapshot.data();
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      req.session.user = { username };
      await auth.signInWithEmailAndPassword(username, password);
      res.redirect('/tickets');
    } else {
      res.send('Contraseña incorrecta');
    }
  } catch (error) {
    res.status(500).send('Error al iniciar sesión: ' + error.message);
  }
});

router.post('/tickets', isAuthenticated, async (req, res) => {
  const { ticketNumber } = req.body;
  const user = req.session.user;

  try {
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
  } catch (error) {
    res.status(500).send('Error al validar el ticket: ' + error.message);
  }
});

router.get('/api/tickets', isAuthenticated, async (req, res) => {
  const user = req.session.user;

  try {
    const ticketsSnapshot = await db.collection('tickets').where('user', '==', user.username).get();
    const tickets = ticketsSnapshot.docs.map(doc => doc.data());
    res.json(tickets);
  } catch (error) {
    res.status(500).send('Error al obtener los tickets: ' + error.message);
  }
});

router.get('/api/resumen', isAuthenticated, async (req, res) => {
  const user = req.session.user;

  try {
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
  } catch (error) {
    res.status(500).send('Error al obtener el resumen: ' + error.message);
  }
});

module.exports = router;
