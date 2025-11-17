const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const auth = require('./authMiddleware');

const router = express.Router();

// POST /v2/users/register - cria usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'email e password são obrigatórios' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [
      email
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /v2/users/login - autentica e devolve JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'email e password são obrigatórios' });
    }

    const result = await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: 'JWT_SECRET não configurado no servidor' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// GET /v2/users/me - retorna dados do usuário logado (teste do token)
router.get('/me', auth, async (req, res) => {
  try {
    const { id } = req.user;
    const result = await db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário logado' });
  }
});

module.exports = router;

