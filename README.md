# California Utilities - Discord Bot

A feature-rich, modular Discord bot built with discord.js v14, supporting both slash commands and prefix commands. Designed for easy expansion and Railway deployment.

## Features

### Core Systems
- ✅ Modular command/event handler
- ✅ Slash commands & prefix commands
- ✅ PostgreSQL database integration
- ✅ Cooldown system
- ✅ Error handling & logging
- ✅ Per-guild configuration

### Command Categories
- **Utility**: ping, userinfo, serverinfo
- **Fun**: 8ball, coinflip, dice
- **Economy**: balance, daily rewards
- **Moderation**: warn, kick
- **Leveling**: level, leaderboard

## Project Structure

```
src/
├── index.js                 # Bot entry point
├── commands/
│   ├── utility/            # Utility commands
│   ├── fun/                # Fun commands
│   ├── economy/            # Economy commands
│   ├── moderation/         # Moderation commands
│   └── leveling/           # Leveling commands
├── events/
│   ├── ready.js            # Bot ready event
│   ├── interactionCreate.js # Slash command handler
│   ├── messageCreate.js     # Prefix command handler
│   ├── guildCreate.js       # Guild join event
│   └── guildDelete.js       # Guild leave event
├── database/
│   ├── db.js               # Database connection
│   └── migrate.js          # Database migrations
└── utils/
    ├── commandLoader.js    # Command loader
    ├── eventLoader.js      # Event loader
    ├── helpers.js          # Helper functions
    └── cooldown.js         # Cooldown system
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Discord Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vyxz1s3/California-Utilities.git
   cd California-Utilities
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_test_guild_id (optional, for testing)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=california_utilities
   PREFIX=!
   ```

4. **Create the database**
   ```bash
   createdb california_utilities
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Start the bot**
   ```bash
   npm start
   ```

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the token and add to `.env` as `DISCORD_TOKEN`
5. Go to "OAuth2" → "URL Generator"
6. Select scopes: `bot`
7. Select permissions:
   - Send Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Moderate Members
   - Manage Roles
   - Manage Channels
8. Copy the generated URL and invite the bot to your server

## Adding Commands

### Slash Command Example
```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My command description'),
  
  name: 'mycommand',
  description: 'My command description',

  async execute(interaction, client) {
    await interaction.reply('Hello!');
  },
};
```

### Prefix Command Example
```javascript
export default {
  name: 'mycommand',
  description: 'My command description',

  async execute(message, args, client) {
    message.reply('Hello!');
  },
};
```

Place commands in the appropriate category folder under `src/commands/`.

## Adding Events

```javascript
export default {
  name: 'eventName',
  once: false, // Set to true for one-time events
  
  async execute(client, ...args) {
    // Event logic
  },
};
```

Place events in `src/events/`.

## Database Schema

The bot includes tables for:
- **users**: Global user data (balance, level, XP)
- **guilds**: Guild configuration
- **guild_settings**: Per-guild settings
- **members**: Per-guild member data
- **inventory**: User inventory items
- **modlogs**: Moderation logs
- **custom_commands**: Guild-specific commands
- **reminders**: User reminders
- **tickets**: Support tickets
- **reaction_roles**: Reaction role mappings

## Railway Deployment

### 1. Create a Railway Project
- Go to [Railway.app](https://railway.app)
- Create a new project

### 2. Add PostgreSQL
- Click "Add Service" → Select "PostgreSQL"
- Railway will create a database automatically

### 3. Deploy the Bot
- Connect your GitHub repository
- Railway will auto-detect the Node.js project
- Set environment variables in the Railway dashboard:
  - `DISCORD_TOKEN`
  - `CLIENT_ID`
  - `DB_HOST` (Railway provides this)
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `PREFIX`
  - `NODE_ENV=production`

### 4. Run Migrations
- In Railway, open the bot service
- Go to "Deployments" → "Logs"
- Run: `npm run migrate`

### 5. Deploy
- Push to GitHub
- Railway will auto-deploy

## Expanding the Bot

### Add a New Command Category
1. Create a folder in `src/commands/` (e.g., `src/commands/music/`)
2. Add command files following the examples
3. Commands are auto-loaded on startup

### Add a New Event
1. Create a file in `src/events/` (e.g., `src/events/messageReactionAdd.js`)
2. Events are auto-loaded on startup

### Add Database Tables
1. Edit `src/database/migrate.js`
2. Add your migration SQL
3. Run `npm run migrate`

### Add Helper Functions
1. Edit `src/utils/helpers.js`
2. Export your function
3. Import in commands/events as needed

## Common Commands

| Command | Description |
|---------|-------------|
| `/ping` | Check bot latency |
| `/userinfo [user]` | Get user information |
| `/serverinfo` | Get server information |
| `/8ball <question>` | Ask the magic 8ball |
| `/coinflip` | Flip a coin |
| `/dice [sides]` | Roll a dice |
| `/balance [user]` | Check balance |
| `/daily` | Claim daily reward |
| `/warn <user> [reason]` | Warn a user |
| `/kick <user> [reason]` | Kick a user |
| `/level [user]` | Check level |
| `/leaderboard` | View leaderboard |

## Troubleshooting

### Bot doesn't respond to commands
- Check if bot has proper permissions
- Verify `DISCORD_TOKEN` is correct
- Check bot intents in `src/index.js`

### Database connection fails
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database exists: `createdb california_utilities`

### Slash commands not showing
- Restart the bot
- Check bot has `applications.commands` scope
- Verify commands are in correct folder structure

## Contributing

Feel free to add more commands, features, and improvements!

## License

MIT

## Support

For issues and questions, open a GitHub issue or contact the maintainer.

