const users = [
  { id: 1, email: 'test@test.com', password: '123', role: 'user' }
];

// Repositorio en memoria: capa de acceso a datos basada en este arreglo local.
// Sirve para practicar Passport sin MongoDB; en producción se reemplaza por Mongoose.
function findUserByCredentials(email, password) {
  return users.find(user => user.email === email && user.password === password);
}

function findUserById(id) {
  return users.find(user => user.id === id);
}

module.exports = { findUserByCredentials, findUserById };
