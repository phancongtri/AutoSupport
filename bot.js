const TelegramBot = require("node-telegram-bot-api");
const pool = require("./database");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log("🤖 Bot Telegram đang chạy...");

// 📌 Lệnh /start - Lưu user vào database
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || "Không có username";
  const fullName = `${msg.chat.first_name || ""} ${msg.chat.last_name || ""}`.trim();

  try {
    await pool.query(
      "INSERT INTO customers (contact) VALUES ($1) ON CONFLICT (contact) DO NOTHING",
      [username]
    );
    bot.sendMessage(chatId, `👋 Chào ${fullName}, bạn đã được lưu vào hệ thống!`);
  } catch (err) {
    console.error("❌ Lỗi khi thêm user:", err);
    bot.sendMessage(chatId, "⚠️ Đã xảy ra lỗi khi lưu thông tin.");
  }
});

// 📌 Lệnh /list - Danh sách khách hàng
bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const result = await pool.query("SELECT id, contact FROM customers");
    let message = "📋 Danh sách khách hàng:\n\n";

    result.rows.forEach((row) => {
      message += `🆔 ID: ${row.id}\n👤 Username: ${row.contact}\n\n`;
    });

    bot.sendMessage(chatId, message);
  } catch (err) {
    console.error("❌ Lỗi truy vấn danh sách:", err);
    bot.sendMessage(chatId, "⚠️ Không thể lấy danh sách khách hàng.");
  }
});

// 📌 Lệnh /update <username> <new_item> - Cập nhật thông tin khách hàng
bot.onText(/\/update (\S+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1];
  const newItem = match[2];

  try {
    const result = await pool.query(
      "UPDATE customers SET item = $1 WHERE contact = $2 RETURNING *",
      [newItem, username]
    );

    if (result.rowCount > 0) {
      bot.sendMessage(chatId, `✅ Đã cập nhật khách hàng **${username}** thành **${newItem}**.`);
    } else {
      bot.sendMessage(chatId, `⚠️ Không tìm thấy khách hàng **${username}**.`);
    }
  } catch (err) {
    console.error("❌ Lỗi cập nhật dữ liệu:", err);
    bot.sendMessage(chatId, "⚠️ Đã xảy ra lỗi khi cập nhật thông tin.");
  }
});

// 📌 Lệnh /delete <username> - Xóa khách hàng
bot.onText(/\/delete (\S+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1];

  try {
    const result = await pool.query("DELETE FROM customers WHERE contact = $1", [username]);

    if (result.rowCount > 0) {
      bot.sendMessage(chatId, `✅ Đã xóa khách hàng **${username}**.`);
    } else {
      bot.sendMessage(chatId, `⚠️ Không tìm thấy khách hàng **${username}**.`);
    }
  } catch (err) {
    console.error("❌ Lỗi xóa dữ liệu:", err);
    bot.sendMessage(chatId, "⚠️ Đã xảy ra lỗi khi xóa khách hàng.");
  }
});

