const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const productsRoutes = require('./productsRoutes');
const usersV2Routes = require('./usersV2Routes');
const productsV2Routes = require('./productsV2Routes');

const app = express();

app.use(cors());
app.use(express.json());

// Rota raiz para teste rápido
app.get('/', (req, res) => {
  res.json({
    message: 'API Fake Store pedagógica',
    endpoints: [
      '/products',
      '/products/:id',
      '/v2/users/register',
      '/v2/users/login',
      '/v2/products'
    ]
  });
});

// Rotas de produtos
app.use('/products', productsRoutes);

// Rotas com autenticação (v2)
app.use('/v2/users', usersV2Routes);
app.use('/v2/products', productsV2Routes);

// Cria tabela se não existir (seed é feito pelo script src/seed.js)
async function ensureDatabaseSetup() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      description TEXT,
      category TEXT,
      image TEXT,
      rating_rate NUMERIC(3, 1) DEFAULT 0,
      rating_count INTEGER DEFAULT 0
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Garante que a sequence do SERIAL de products esteja alinhada com o maior id
  await db.query(`
    SELECT setval(
      pg_get_serial_sequence('products', 'id'),
      COALESCE((SELECT MAX(id) FROM products), 1)
    );
  `);

  // Garante que a sequence do SERIAL de users esteja alinhada com o maior id
  await db.query(`
    SELECT setval(
      pg_get_serial_sequence('users', 'id'),
      COALESCE((SELECT MAX(id) FROM users), 1)
    );
  `);
}

const port = process.env.PORT || 3000;

ensureDatabaseSetup()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch(err => {
    console.error('Erro ao configurar o banco', err);
    process.exit(1);
  });

module.exports = app;
