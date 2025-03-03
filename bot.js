require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const pool = require("./database");

// Khởi tạo bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log("🤖 Bot Telegram đang chạy...");

// 📌 Kiểm tra kết nối PostgreSQL trước khi chạy bot
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("🔴 Lỗi kết nối PostgreSQL:", err);
  } else {
    console.log("🟢 Kết nối PostgreSQL thành công! Thời gian server:", res.rows[0].now);
  }
});

// 📌 Lệnh /list - Hiển thị danh sách khách hàng
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    console.log("📋 Đang lấy danh sách khách hàng...");

    // Truy vấn lấy danh sách khách hàng + mặt hàng + ngày hết hạn
    const result = await pool.query(`
      SELECT 
        c.id AS customer_id, 
        c.contact, 
        COALESCE(w.item, 'Không có mặt hàng') AS item_name,
        COALESCE(ci.expiry_date, NULL) AS expiry_date
      FROM customers c
      LEFT JOIN customer_items ci ON c.id = ci.customer_id
      LEFT JOIN warehouse w ON ci.item_id = w.id
      ORDER BY c.id ASC
    `);

    if (result.rowCount === 0) {
      bot.sendMessage(chatId, "🚫 Không có khách hàng nào trong hệ thống.");
      return;
    }

    let response = "📜 Danh sách khách hàng:\n";
    result.rows.forEach((row) => {
      let daysLeft = "Chưa có hạn sử dụng";
      if (row.expiry_date) {
        const today = new Date();
        const expiryDate = new Date(row.expiry_date);
        const diffTime = expiryDate - today;
        daysLeft = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0) + " ngày còn lại";
      }

      response += `👤 ${row.contact} | 🆔 ${row.customer_id} | 📦 ${row.item_name} | ⏳ ${daysLeft}\n`;
    });

    bot.sendMessage(chatId, response);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách khách hàng:", error);
    bot.sendMessage(chatId, "❌ Lỗi khi lấy danh sách khách hàng.");
  }
});
