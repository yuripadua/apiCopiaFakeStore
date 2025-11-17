const db = require('./db');
const productsData = require('./productsData');

async function seed() {
  try {
    await db.query('BEGIN');

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
      console.log('Seed concluído com 20 produtos.');
    } else {
      console.log(`Tabela products já possui ${count} registros. Nenhum insert realizado.`);
    }

    // Garante que a sequence do SERIAL esteja alinhada com o maior id existente
    await db.query(`
      SELECT setval(
        pg_get_serial_sequence('products', 'id'),
        COALESCE((SELECT MAX(id) FROM products), 1)
      );
    `);

    await db.query('COMMIT');
  } catch (err) {
    console.error('Erro ao rodar seed:', err);
    await db.query('ROLLBACK');
  } finally {
    process.exit(0);
  }
}

seed();
