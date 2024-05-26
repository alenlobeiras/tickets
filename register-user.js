// register-user.js
const firebase = require("firebase/app");
require("firebase/firestore");
const bcrypt = require('bcrypt');

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function registerUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').doc(username).set({
    username: username,
    password: hashedPassword
  });
  console.log(`Usuario ${username} registrado`);
}

// Registrar un usuario
registerUser('usuario1', 'contrasena123');
