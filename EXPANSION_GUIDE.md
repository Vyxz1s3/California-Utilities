# California Utilities - Expansion Guide

This guide shows you how to add all the features you planned for the bot.

## Command Template

### Slash Command + Prefix Command
```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  // Slash command definition
  data: new SlashCommandBuilder()
    .setName('commandname')
    .setDescription('Command description')
    .addStringOption(option =>
      option.setName('option')
        .setDescription('Option description')
        .setRequired(true)
    ),
  
  // Prefix command metadata
  name: 'commandname',
  description: 'Command description',

  // Execution logic (works for both slash and prefix)
  async execute(interaction, client) {
    // For slash commands: interaction is ChatInputCommandInteraction
    // For prefix commands: interaction is Message
    
    if (interaction.isCommand?.()) {
      // Slash command logic
      await interaction.reply('Response');
    } else {
      // Prefix command logic
      await interaction.reply('Response');
    }
  },
};
```

## Feature Implementation Checklist

### ✅ Core Features (Already Implemented)
- [x] Modular command/event structure
- [x] Slash commands
- [x] Prefix commands
- [x] PostgreSQL integration
- [x] Cooldown system
- [x] Error handling

### 🔧 Moderation (Partially Implemented)
- [x] Warn command
- [x] Kick command
- [ ] Ban command
- [ ] Mute command
- [ ] Unmute command
- [ ] Timeout command
- [ ] Slowmode command
- [ ] Lockdown command
- [ ] Unlock command
- [ ] Purge/Clear command
- [ ] Modlog viewer
- [ ] Punishment history
- [ ] Appeals system
- [ ] Auto moderation (spam, links, raids)
- [ ] Anti-nuke protection

**Database Tables Needed:**
- `modlogs` (already created)
- `mutes` (for mute tracking)
- `bans` (for ban tracking)
- `appeals` (for appeal system)

### 🎉 Fun Commands (Partially Implemented)
- [x] 8ball
- [x] Coinflip
- [x] Dice
- [ ] Memes (API integration)
- [ ] Jokes (API integration)
- [ ] Trivia
- [ ] RPS (Rock Paper Scissors)
- [ ] Tic Tac Toe
- [ ] Connect Four
- [ ] Blackjack
- [ ] Slots
- [ ] Minesweeper
- [ ] Guess the number
- [ ] Would You Rather
- [ ] Truth or Dare
- [ ] AI chat (OpenAI integration)
- [ ] Image generation (API integration)
- [ ] GIF search (Tenor/Giphy API)

### 💰 Economy (Partially Implemented)
- [x] Balance
- [x] Daily rewards
- [ ] Work command
- [ ] Crime command
- [ ] Beg command
- [ ] Rob command
- [ ] Bank system (deposit/withdraw)
- [ ] Shop system
- [ ] Inventory system
- [ ] Items/Trading
- [ ] Leaderboards (balance, level)
- [ ] Gambling (blackjack, slots)
- [ ] Fishing
- [ ] Mining
- [ ] Farming
- [ ] Businesses
- [ ] Pets
- [ ] Achievements

**Database Tables Needed:**
- `users` (already created)
- `inventory` (already created)
- `shop_items`
- `user_items`
- `businesses`
- `pets`
- `achievements`

### 🎵 Music Playback
- [ ] Play songs
- [ ] Queue management
- [ ] Skip
- [ ] Pause/Resume
- [ ] Stop
- [ ] Loop
- [ ] Shuffle
- [ ] Volume control
- [ ] Lyrics
- [ ] Search YouTube/Spotify
- [ ] Playlist support
- [ ] Autoplay
- [ ] Now Playing

**Dependencies:**
```bash
npm install discord-player @discord-player/extractor
```

**Example Music Command:**
```javascript
import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
    ),
  
  name: 'play',
  description: 'Play a song',

  async execute(interaction, client) {
    const player = useMainPlayer();
    const query = interaction.options.getString('query');
    
    if (!interaction.member.voice.channel) {
      return interaction.reply('❌ You must be in a voice channel!');
    }

    await interaction.deferReply();
    
    try {
      const { track, playlist } = await player.search(query, {
        requestedBy: interaction.user,
      });

      if (!track) {
        return interaction.editReply('❌ No results found!');
      }

      const queue = player.nodes.create(interaction.guild, {
        metadata: interaction.channel,
      });

      if (!queue.connection) {
        await queue.connect(interaction.member.voice.channel);
      }

      await queue.play(track);
      interaction.editReply(`▶️ Now playing: **${track.title}**`);
    } catch (err) {
      interaction.editReply('❌ Error playing song!');
    }
  },
};
```

### 🛠️ Utility Commands (Partially Implemented)
- [x] Avatar lookup
- [x] User info
- [x] Server info
- [ ] Role info
- [ ] Channel info
- [ ] Emoji info
- [ ] Bot statistics
- [x] Ping
- [ ] Uptime
- [ ] Weather (API integration)
- [ ] Calculator
- [ ] Unit converter
- [ ] QR code generator
- [ ] Translate (API integration)
- [ ] Time zones
- [ ] Urban Dictionary lookup
- [ ] Wikipedia search

### 📊 Leveling System (Partially Implemented)
- [x] Level tracking
- [x] XP system
- [x] Leaderboard
- [ ] Level-up messages
- [ ] Level roles
- [ ] Prestige system
- [ ] Multipliers

### 📝 Logging & Moderation
- [ ] Welcome messages
- [ ] Goodbye messages
- [ ] Auto moderation
- [ ] Verification system
- [ ] Ticket system
- [ ] Reaction roles
- [ ] Role management
- [ ] Server statistics
- [ ] Custom commands
- [ ] Polls & giveaways
- [ ] Reminders
- [ ] Suggestions system
- [ ] Starboard
- [ ] AFK system
- [ ] Temporary voice channels
- [ ] Auto responses
- [ ] Counting channel
- [ ] Confessions system
- [ ] Birthday reminders
- [ ] Embed builder
- [ ] Server backup & restore
- [ ] Message sniping
- [ ] Sticky messages
- [ ] Invite tracking

## Adding a New Command Category

1. Create folder: `src/commands/newcategory/`
2. Create command file: `src/commands/newcategory/commandname.js`
3. Follow the command template above
4. Commands auto-load on startup

## Adding Database Tables

Edit `src/database/migrate.js`:

```javascript
const migrations = [
  // ... existing migrations
  `CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    guild_id BIGINT,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,
];
```

Then run: `npm run migrate`

## Adding Helper Functions

Edit `src/utils/helpers.js`:

```javascript
export async function myNewHelper(param) {
  // Implementation
  return result;
}
```

Import in commands:
```javascript
import { myNewHelper } from '../../utils/helpers.js';
```

## API Integration Examples

### Weather API
```bash
npm install axios
```

```javascript
import axios from 'axios';

async function getWeather(city) {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
  );
  return response.data;
}
```

### Meme API
```javascript
async function getMeme() {
  const response = await axios.get('https://api.imgflip.com/get_memes');
  const memes = response.data.data.memes;
  return memes[Math.floor(Math.random() * memes.length)];
}
```

### Joke API
```javascript
async function getJoke() {
  const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
  return response.data;
}
```

## Event Listeners

Add new events in `src/events/`:

```javascript
export default {
  name: 'messageReactionAdd',
  async execute(client, reaction, user) {
    // Handle reaction
  },
};
```

Available events:
- `messageCreate` (already implemented)
- `interactionCreate` (already implemented)
- `guildCreate` (already implemented)
- `guildDelete` (already implemented)
- `guildMemberAdd`
- `guildMemberRemove`
- `messageReactionAdd`
- `messageReactionRemove`
- `voiceStateUpdate`
- `presenceUpdate`
- `channelCreate`
- `channelDelete`
- `roleCreate`
- `roleDelete`

## Testing Commands Locally

```bash
npm run dev
```

This uses nodemon for auto-restart on file changes.

## Deployment Checklist

- [ ] All commands tested locally
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Bot permissions configured
- [ ] Intents enabled
- [ ] Error handling in place
- [ ] Cooldowns working
- [ ] Commands documented

## Performance Tips

1. **Use caching** for frequently accessed data
2. **Batch database queries** when possible
3. **Use Discord.js collections** for in-memory data
4. **Implement rate limiting** for API calls
5. **Use embeds** instead of plain text for better UX
6. **Defer interactions** for long-running commands
7. **Use pagination** for large lists

## Common Patterns

### Pagination
```javascript
const items = [...]; // Large array
const page = 1;
const itemsPerPage = 10;
const start = (page - 1) * itemsPerPage;
const end = start + itemsPerPage;
const pageItems = items.slice(start, end);
```

### Confirmation
```javascript
const filter = i => i.user.id === interaction.user.id;
const confirmation = await interaction.channel.awaitMessageComponent({
  filter,
  time: 15000,
});
```

### Database Transactions
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // Multiple queries
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

## Next Steps

1. Start with high-priority features
2. Test thoroughly before deployment
3. Gather user feedback
4. Iterate and improve
5. Add more features based on demand

Good luck building! 🚀

