const express = require('express');
const db = require('./db');
const auth = require('./authMiddleware');

const router = express.Router();

// Todas as rotas v2 de produtos exigem JWT
router.use(auth);

// GET /v2/products
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id');
    const products = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      description: row.description,
      category: row.category,
      image: row.image,
      rating: {
        rate: Number(row.rating_rate),
        count: row.rating_count
      }
    }));
    res.json(products);
  } catch (err) {
    console.error('Erro ao listar produtos v2:', err);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// GET /v2/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      description: row.description,
      category: row.category,
      image: row.image,
      rating: {
        rate: Number(row.rating_rate),
        count: row.rating_count
      }
    });
  } catch (err) {
    console.error('Erro ao buscar produto v2:', err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /v2/products
router.post('/', async (req, res) => {
  try {
    const { title, price, description, category, image, rating } = req.body;

    if (!title || price == null) {
      return res.status(400).json({ error: 'title e price são obrigatórios' });
    }

    const ratingRate = rating && rating.rate != null ? rating.rate : 0;
    const ratingCount = rating && rating.count != null ? rating.count : 0;

    const result = await db.query(
      `INSERT INTO products (title, price, description, category, image, rating_rate, rating_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, price, description || '', category || '', image || '', ratingRate, ratingCount]
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      description: row.description,
      category: row.category,
      image: row.image,
      rating: {
        rate: Number(row.rating_rate),
        count: row.rating_count
      }
    });
  } catch (err) {
    console.error('Erro ao criar produto v2:', err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT /v2/products/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, price, description, category, image, rating } = req.body;

    if (!title || price == null) {
      return res.status(400).json({ error: 'title e price são obrigatórios' });
    }

    const ratingRate = rating && rating.rate != null ? rating.rate : 0;
    const ratingCount = rating && rating.count != null ? rating.count : 0;

    const result = await db.query(
      `UPDATE products
       SET title = $1,
           price = $2,
           description = $3,
           category = $4,
           image = $5,
           rating_rate = $6,
           rating_count = $7
       WHERE id = $8
       RETURNING *`,
      [title, price, description || '', category || '', image || '', ratingRate, ratingCount, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      title: row.title,
      price: Number(row.price),
      description: row.description,
      category: row.category,
      image: row.image,
      rating: {
        rate: Number(row.rating_rate),
        count: row.rating_count
      }
    });
  } catch (err) {
    console.error('Erro ao atualizar produto v2:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETE /v2/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao remover produto v2:', err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

module.exports = router;

