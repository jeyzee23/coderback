import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { config } from './config/config.js';
import { connectDB } from './config/database.js';
import { initializePassport } from './config/passport.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import router from './routes/index.js';

const app = express();

initializePassport(passport);
app.use(passport.initialize());

/**
 * !allowedRoles.includes(req.user.role)
 * 
 * const allowedRoles = ['user', 'admin', 'doctor]
 * 
 * /getUsers => (req, res, next) => {
 *    req.user.role === 'user'
 *    !allowedRoles.includes(req.user.role)
 * 
 *       next();
 * }
 */

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', router);

app.use(notFoundHandler);
app.use(errorHandler);

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

export default app;