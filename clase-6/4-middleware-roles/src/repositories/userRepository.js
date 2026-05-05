const users = [
  { id: 1, email: 'user@test.com', password: '123', role: 'user' },
  { id: 2, email: 'admin@test.com', password: '123', role: 'admin' },
  { id: 3, email: 'mod@test.com', password: '123', role: 'moderator' }
];

// Repositorio en memoria: capa de acceso a datos basada en este arreglo local.
// Sirve para practicar roles sin instalar MongoDB; en una app real consultaría Mongoose.
function findUserByEmail(email) {
  return users.find(user => user.email === email);
}

function findUserById(id) {
  return users.find(user => user.id === id);
}

module.exports = { findUserByEmail, findUserById };
