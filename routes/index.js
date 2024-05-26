const express = require('express');
const path = require('path');
const router = express.Router();
const { db } = require('../firebase-config');

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

  console.log(`Attempting login for user: ${username}`);

  try {
    // Buscar el documento del usuario basado en el username
    const usersSnapshot = await db.collection('users').where('username', '==', username).get();
    if (usersSnapshot.empty) {
      console.error('Usuario no encontrado');
      return res.status(404).send('Usuario no encontrado');
    }

    const user = usersSnapshot.docs[0].data();
    console.log(`User found: ${JSON.stringify(user)}`);

    if (password === user.password) {
      req.session.user = { username };
      console.log('User signed in successfully');
      res.redirect('/tickets');
    } else {
      console.error('Contraseña incorrecta');
      res.status(401).send('Contraseña incorrecta');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
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
