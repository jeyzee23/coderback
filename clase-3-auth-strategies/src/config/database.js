import { MongoClient } from 'mongodb';

let db = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definida en el archivo .env');
  }

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  console.log(`✅ Conectado a MongoDB - base de datos: ${db.databaseName}`);
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error('No hay conexión a MongoDB. Llamá a connectDB() primero.');
  }
  return db;
}
