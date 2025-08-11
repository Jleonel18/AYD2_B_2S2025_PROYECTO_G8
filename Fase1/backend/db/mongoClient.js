let instancia = null;
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  if (!instancia) {
    instancia = await mongoose.connect(process.env.MONGO_URI);
  }
  return instancia;
};