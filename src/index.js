import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { initializeDatabase } from './database/db.js';
import { loadCommands } from './utils/commandLoader.js';
import { loadEvents } from './utils/eventLoader.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for required token
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN environment variable is not set!');
  console.error('Please set DISCORD_TOKEN in your .env file or Railway environment variables.');
  process.exit(1);
}

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
  ],
});

// Initialize collections
client.commands = new Collection();
client.prefixCommands = new Collection();
client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.events = new Collection();

// Initialize database
await initializeDatabase();

// Load commands and events
await loadCommands(client, __dirname);
await loadEvents(client, __dirname);

client.login(process.env.DISCORD_TOKEN);

