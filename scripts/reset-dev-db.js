const mysql = require("mysql2/promise");
(async () => {
  try {
    const url = process.env.DEV_DATABASE_URL;
    if (!url) throw new Error("DEV_DATABASE_URL not set");
    // Connect without database selected to recreate it
    const parsed = new URL(url);
    const conn = await mysql.createConnection({
      host: parsed.hostname,
      port: Number(parsed.port) || 3307,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
    });
    await conn.query("DROP DATABASE IF EXISTS thth_dev");
    await conn.query("CREATE DATABASE thth_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    await conn.end();
    console.log("thth_dev database reset clean!");
  } catch (err) {
    console.error("Error resetting thth_dev:", err);
    process.exit(1);
  }
})();
