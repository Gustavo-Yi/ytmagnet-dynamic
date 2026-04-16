-- 重置数据库脚本
-- 警告：执行此脚本将清空所有现有留言记录和 IP 限制记录

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS rate_limits;

-- 创建留言表
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,              -- 姓名
    email TEXT,             -- 电子邮箱
    country_code TEXT,      -- 区号
    whatsapp TEXT,          -- WhatsApp 号码
    message TEXT,           -- 留言内容
    ip TEXT,                -- 来源 IP
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 提交时间
);

-- 创建 IP 频率限制表
CREATE TABLE rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    window_start INTEGER    -- 时间窗口起始点
);
