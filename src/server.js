const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const productsRoutes = require('./productsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rota raiz para teste rápido
app.get('/', (req, res) => {
  res.json({
    message: 'API Fake Store pedagógica',
    endpoints: ['/products', '/products/:id']
  });
});

// Rotas de produtos
app.use('/products', productsRoutes);

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

  // Garante que a sequence do SERIAL esteja alinhada com o maior id
  await db.query(`
    SELECT setval(
      pg_get_serial_sequence('products', 'id'),
      COALESCE((SELECT MAX(id) FROM products), 1)
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
