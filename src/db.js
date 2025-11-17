const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida. Configure no .env ou nas variáveis da Vercel.');
}

// Conexão serverless com o Neon usando a connection string
const sql = neon(process.env.DATABASE_URL);

module.exports = {
  // Mantém a mesma interface db.query(text, params)
  query: (text, params) => sql(text, params)
};

