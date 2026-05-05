import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client = null;
let db = null;

export const connectDB = async () => {
  try {
    client = new MongoClient(config.mongoUri);
    await client.connect();
    db = client.db(config.dbName);
    console.log(`✅ Conectado a MongoDB - base de datos: ${config.dbName}`);
    return db;
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    throw err;
  }
};

export const getDB = () => {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
};

export const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
};