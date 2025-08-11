const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/mongoClient');

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a MongoDB
connectDB()
  .then(() => {
    console.log('Conectado a MongoDB con única instancia');
    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a Mongo:', err);
  });