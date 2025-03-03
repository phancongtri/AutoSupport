const pool = require("./database");

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        contact TEXT NOT NULL UNIQUE,
        item TEXT DEFAULT 'Khách hàng mới',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiry_date TIMESTAMP DEFAULT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS warehouse (
        id SERIAL PRIMARY KEY,
        item TEXT NOT NULL,
        info TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        account_info TEXT DEFAULT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_items (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        item_id INTEGER NOT NULL REFERENCES warehouse(id),
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expiry_date TIMESTAMP DEFAULT NULL
      );
    `);

    console.log("✅ Tạo bảng thành công!");
  } catch (err) {
    console.error("❌ Lỗi tạo bảng:", err);
  } finally {
    pool.end();
  }
}

createTables();
