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

  // Economy: shop items catalogue
  `CREATE TABLE IF NOT EXISTS economy_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    price INT NOT NULL,
    sell_price INT NOT NULL,
    description TEXT,
    emoji VARCHAR(50),
    rarity VARCHAR(50) DEFAULT 'common',
    usable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Economy: user inventory
  `CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id INT NOT NULL REFERENCES economy_items(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, item_id)
  )`,

  // Economy: user businesses
  `CREATE TABLE IF NOT EXISTS user_businesses (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    level INT DEFAULT 1,
    total_earnings BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Economy: user pets
  `CREATE TABLE IF NOT EXISTS user_pets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pet_type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    happiness INT DEFAULT 100,
    hunger INT DEFAULT 0,
    adopted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Economy: user achievements
  `CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, achievement_id)
  )`,

  // Economy: user cooldowns (persistent across restarts)
  `CREATE TABLE IF NOT EXISTS user_cooldowns (
    user_id BIGINT NOT NULL,
    command VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, command)
  )`,

  // Moderation: per-user warnings log
  `CREATE TABLE IF NOT EXISTS user_warnings (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    moderator_id BIGINT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Moderation: punishment appeals
  `CREATE TABLE IF NOT EXISTS appeals (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by BIGINT,
    review_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
  )`,

  // Moderation: member notes
  `CREATE TABLE IF NOT EXISTS member_notes (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    moderator_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Roblox verification: per-user verification records
  `CREATE TABLE IF NOT EXISTS roblox_verifications (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    roblox_username VARCHAR(255) NOT NULL,
    roblox_user_id BIGINT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (guild_id, user_id)
  )`,

  // Roblox verification: per-guild configuration
  `CREATE TABLE IF NOT EXISTS guild_verification_settings (
    guild_id BIGINT PRIMARY KEY,
    verified_role_id BIGINT,
    unverified_role_id BIGINT,
    verification_channel_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Polls
  `CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    message_id BIGINT,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    created_by BIGINT NOT NULL,
    ends_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Giveaways
  `CREATE TABLE IF NOT EXISTS giveaways (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    message_id BIGINT,
    prize TEXT NOT NULL,
    winners INT DEFAULT 1,
    hosted_by BIGINT NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Suggestions
  `CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by BIGINT,
    review_reason TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Starboard messages
  `CREATE TABLE IF NOT EXISTS starboard_messages (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    message_id BIGINT NOT NULL UNIQUE,
    author_id BIGINT NOT NULL,
    star_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // AFK users
  `CREATE TABLE IF NOT EXISTS afk_users (
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason TEXT DEFAULT 'AFK',
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Temp voice channels
  `CREATE TABLE IF NOT EXISTS temp_voice_channels (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Auto responses
  `CREATE TABLE IF NOT EXISTS auto_responses (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    trigger VARCHAR(255) NOT NULL,
    response TEXT NOT NULL,
    exact_match BOOLEAN DEFAULT FALSE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    UNIQUE (guild_id, trigger)
  )`,

  // Counting channel data
  `CREATE TABLE IF NOT EXISTS counting_channel_data (
    guild_id BIGINT PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    current_count BIGINT DEFAULT 0,
    high_score BIGINT DEFAULT 0,
    last_user_id BIGINT,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Confessions
  `CREATE TABLE IF NOT EXISTS confessions (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Birthdays
  `CREATE TABLE IF NOT EXISTS birthdays (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    birthday DATE NOT NULL,
    year_known BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Backups
  `CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Sticky messages
  `CREATE TABLE IF NOT EXISTS sticky_messages (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL UNIQUE,
    message_id BIGINT,
    content TEXT NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Invite tracking
  `CREATE TABLE IF NOT EXISTS invite_tracking (
    id SERIAL PRIMARY KEY,
    guild_id BIGINT NOT NULL,
    inviter_id BIGINT NOT NULL,
    invite_code VARCHAR(50) NOT NULL,
    uses INT DEFAULT 0,
    left_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    UNIQUE (guild_id, invite_code)
  )`,

  // Disabled commands per guild
  `CREATE TABLE IF NOT EXISTS disabled_commands (
    guild_id BIGINT NOT NULL,
    command_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (guild_id, command_name),
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,

  // Ticket messages log
  `CREATE TABLE IF NOT EXISTS ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Moderation: extended guild settings for anti-abuse toggles
  `ALTER TABLE guild_settings
    ADD COLUMN IF NOT EXISTS anti_spam BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS anti_link BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS anti_raid BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS anti_nuke BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS spam_threshold INT DEFAULT 5,
    ADD COLUMN IF NOT EXISTS raid_threshold INT DEFAULT 10
  `,

  // Seed default shop items (idempotent)
  `INSERT INTO economy_items (name, price, sell_price, description, emoji, rarity, usable) VALUES
    ('Apple',          10,    5,    'A fresh apple.',                          '🍎', 'common',    FALSE),
    ('Bread',          15,    7,    'A loaf of bread.',                        '🍞', 'common',    FALSE),
    ('Fish',           20,    10,   'A raw fish.',                             '🐟', 'common',    FALSE),
    ('Sword',          100,   50,   'A sturdy iron sword.',                    '⚔️', 'uncommon',  FALSE),
    ('Shield',         100,   50,   'A reliable iron shield.',                 '🛡️', 'uncommon',  FALSE),
    ('Potion',         50,    25,   'Restores your energy.',                   '🧪', 'uncommon',  TRUE),
    ('Mystery Box',    250,   0,    'Contains a random item.',                 '📦', 'special',   TRUE),
    ('Lucky Coin',     500,   0,    'Boosts your luck for one action.',        '🍀', 'special',   TRUE),
    ('Dragon Egg',     1000,  500,  'A rare dragon egg.',                      '🥚', 'rare',      FALSE),
    ('Legendary Sword',5000,  2500, 'A blade of legend.',                      '🗡️', 'legendary', FALSE)
  ON CONFLICT (name) DO NOTHING`,
];

export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    for (const migration of migrations) {
      await pool.query(migration);
    }

    console.log('✅ All migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  }
}

// Allow running directly: node src/database/migrate.js
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

