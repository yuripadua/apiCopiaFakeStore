const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const productsRoutes = require('./productsRoutes');
const productsData = require('./productsData');

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

// Cria tabela se não existir e faz seed inicial se estiver vazia
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

  const existing = await db.query('SELECT COUNT(*) AS count FROM products');
  const count = Number(existing.rows[0].count);

  if (count === 0) {
    for (const p of productsData) {
      await db.query(
        `INSERT INTO products (id, title, price, description, category, image, rating_rate, rating_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          p.id,
          p.title,
          p.price,
          p.description,
          p.category,
          p.image,
          p.rating_rate,
          p.rating_count
        ]
      );
    }
    console.log('Seed inicial concluído com 20 produtos.');
  }
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
