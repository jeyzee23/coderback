const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// .pre es un middleware de Mongoose: esta función corre antes de ejecutar save().
// Sirve para hashear la contraseña antes de guardarla y no persistir texto plano.
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// .methods agrega métodos propios a cada documento User.
// comparePassword no se guarda en MongoDB; queda disponible en Node.js como user.comparePassword(...).
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
