const { Pool } = require("pg");

// In ra danh sách toàn bộ biến môi trường để debug
console.log("📌 DEBUG: Toàn bộ biến môi trường trên Railway:", process.env);

if (!process.env.DATABASE_URL) {
  console.error("🔴 Lỗi: DATABASE_URL không được thiết lập trên Railway!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Bắt buộc cho Railway
});

// Kiểm tra kết nối PostgreSQL
pool.connect()
  .then(() => console.log("🟢 Kết nối PostgreSQL thành công!"))
  .catch(err => {
    console.error("🔴 Lỗi kết nối PostgreSQL:", err);
    process.exit(1);
  });

module.exports = pool;
