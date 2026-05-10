-- Reset database schema.
-- Warning: running this script clears existing contact messages and IP limits.

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS rate_limits;

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    country_code TEXT,
    whatsapp TEXT,
    message TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    window_start INTEGER
);
