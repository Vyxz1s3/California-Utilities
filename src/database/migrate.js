import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    balance BIGINT DEFAULT 0,
    bank BIGINT DEFAULT 0,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    warnings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Guilds table
  `CREATE TABLE IF NOT EXISTS guilds (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    prefix VARCHAR(10) DEFAULT '!',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Guild settings
  `CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id BIGINT PRIMARY KEY REFERENCES guilds(id) ON DELETE CASCADE,
    welcome_enabled BOOLEAN DEFAULT FALSE,
    welcome_channel_id BIGINT,
    welcome_message TEXT,
    goodbye_enabled BOOLEAN DEFAULT FALSE,
    goodbye_channel_id BIGINT,
    goodbye_message TEXT,
    modlog_channel_id BIGINT,
    auto_role_id BIGINT,
    verification_enabled BOOLEAN DEFAULT FALSE,
    verification_role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Member data
  `CREATE TABLE IF NOT EXISTS members (
    guild_id BIGINT,
    user_id BIGINT,
    nickname VARCHAR(255),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    warnings INT DEFAULT 0,
    mute_until TIMESTAMP,
    PRIMARY KEY (guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Economy items
  `CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    guild_id BIGINT,
    item_name VARCHAR(255),
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Moderation logs
  `CREATE TABLE IF NOT EXISTS modlogs (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT,
    user_id BIGINT,
    moderator_id BIGINT,
    action VARCHAR(50),
    reason TEXT,
    duration INTERVAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Custom commands
  `CREATE TABLE IF NOT EXISTS custom_commands (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT,
    name VARCHAR(255),
    response TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Reminders
  `CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    guild_id BIGINT,
    content TEXT,
    remind_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Tickets
  `CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT,
    channel_id BIGINT,
    user_id BIGINT,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Reaction roles
  `CREATE TABLE IF NOT EXISTS reaction_roles (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT,
    message_id BIGINT,
    emoji VARCHAR(255),
    role_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,
];

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    for (const migration of migrations) {
      await pool.query(migration);
    }
    
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();

