import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';
import { connectDB } from './config/database.js';
import router from './routes/index.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 Server escuchando en http://localhost:${config.port}`);
      console.log(`📚 Docs base: http://localhost:${config.port}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
