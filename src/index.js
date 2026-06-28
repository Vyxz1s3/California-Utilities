import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { initializeDatabase } from './database/db.js';
import { runMigrations } from './database/migrate.js';
import { loadCommands } from './utils/commandLoader.js';
import { loadEvents } from './utils/eventLoader.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
  ],
});

// Initialize collections
client.commands = new Collection();
client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.events = new Collection();

// Snipe caches (in-memory, keyed by channel ID)
client.snipeCache = new Map();
client.editSnipeCache = new Map();

// Initialize database and run migrations
try {
  await initializeDatabase();
  await runMigrations();
} catch (err) {
  console.warn('⚠️ Database initialization/migration skipped:', err.message);
}

// Load commands and events
await loadCommands(client, __dirname);
await loadEvents(client, __dirname);

client.login(process.env.DISCORD_TOKEN);

