const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./reminders.db", (err) => {
  if (err) {
    console.error("Error opening SQLite database:", err.message);
  } else {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message TEXT NOT NULL,
        remind_time INTEGER NOT NULL
      )
    `,
      (err) => {
        if (err) {
          console.error("Error creating reminders table:", err.message);
        }
      }
    );
  }
});

module.exports = db;
