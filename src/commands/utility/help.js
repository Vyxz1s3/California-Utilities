import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORIES = {
  economy: {
    label: 'Economy',
    emoji: '💰',
    color: 0xFFD700,
    description: 'Earn coins, gamble, shop, manage pets and businesses.',
  },
  fun: {
    label: 'Fun',
    emoji: '🎮',
    color: 0xe91e63,
    description: 'Games, trivia, memes, jokes, and entertainment.',
  },
  music: {
    label: 'Music',
    emoji: '🎵',
    color: 0x1DB954,
    description: 'Play, pause, skip, queue, and manage music.',
  },
  moderation: {
    label: 'Moderation',
    emoji: '🔨',
    color: 0xe74c3c,
    description: 'Ban, kick, warn, mute, purge, roles, channels, and more.',
  },
  leveling: {
    label: 'Leveling',
    emoji: '📊',
    color: 0x00FF00,
    description: 'Check levels, XP, and server leaderboards.',
  },
  utility: {
    label: 'Utility',
    emoji: '🔧',
    color: 0x3498db,
    description: 'Avatar, banner, weather, calculator, QR codes, and more.',
  },
  tickets: {
    label: 'Tickets',
    emoji: '🎫',
    color: 0x2ECC71,
    description: 'Create and manage support tickets.',
  },
  roles: {
    label: 'Reaction Roles',
    emoji: '🎭',
    color: 0x9B59B6,
    description: 'Set up and manage reaction roles.',
  },
  giveaways: {
    label: 'Polls & Giveaways',
    emoji: '🎉',
    color: 0xFFD700,
    description: 'Create polls and run giveaways.',
  },
  reminders: {
    label: 'Reminders',
    emoji: '⏰',
    color: 0xF39C12,
    description: 'Set, view, and manage personal reminders.',
  },
  suggestions: {
    label: 'Suggestions',
    emoji: '💡',
    color: 0x5865F2,
    description: 'Submit and manage server suggestions.',
  },
  starboard: {
    label: 'Starboard',
    emoji: '⭐',
    color: 0xFFD700,
    description: 'Star messages and view the starboard.',
  },
  afk: {
    label: 'AFK',
    emoji: '💤',
    color: 0xF39C12,
    description: 'Set and manage AFK status.',
  },
  voice: {
    label: 'Temp Voice',
    emoji: '🎙️',
    color: 0x9B59B6,
    description: 'Create and manage temporary voice channels.',
  },
  auto: {
    label: 'Auto Responses',
    emoji: '🤖',
    color: 0x3498DB,
    description: 'Set up automatic message responses.',
  },
  counting: {
    label: 'Counting',
    emoji: '🔢',
    color: 0x5865F2,
    description: 'Set up and manage a counting channel.',
  },
  confessions: {
    label: 'Confessions',
    emoji: '🤫',
    color: 0x9B59B6,
    description: 'Submit and manage anonymous confessions.',
  },
  birthdays: {
    label: 'Birthdays',
    emoji: '🎂',
    color: 0xFF69B4,
    description: 'Set birthdays and get announcements.',
  },
  embeds: {
    label: 'Embed Builder',
    emoji: '🖼️',
    color: 0x5865F2,
    description: 'Create, edit, and send custom embeds.',
  },
  backups: {
    label: 'Backups',
    emoji: '📦',
    color: 0x2ECC71,
    description: 'Create and restore server configuration backups.',
  },
  sniping: {
    label: 'Message Sniping',
    emoji: '🔍',
    color: 0xE74C3C,
    description: 'Snipe deleted and edited messages.',
  },
  sticky: {
    label: 'Sticky Messages',
    emoji: '📌',
    color: 0xF39C12,
    description: 'Pin sticky messages to channels.',
  },
  invites: {
    label: 'Invite Tracking',
    emoji: '📨',
    color: 0x5865F2,
    description: 'Track and manage server invites.',
  },
  welcome: {
    label: 'Welcome & Goodbye',
    emoji: '👋',
    color: 0x2ECC71,
    description: 'Configure welcome and goodbye messages.',
  },
  logging: {
    label: 'Logging',
    emoji: '📋',
    color: 0x5865F2,
    description: 'View and configure server logs.',
  },
  admin: {
    label: 'Administration',
    emoji: '⚙️',
    color: 0xE74C3C,
    description: 'Server settings, prefix, language, and command management.',
  },
};

// ─── Full command registry ────────────────────────────────────────────────────
// Each entry: { name, description, usage, category, extra? }
const COMMAND_REGISTRY = [
  // ── Economy ──────────────────────────────────────────────────────────────
  {
    name: 'balance',
    description: 'Check your wallet and bank balance.',
    usage: '/balance [user]',
    category: 'economy',
  },
  {
    name: 'deposit',
    description: 'Deposit coins from your wallet into the bank.',
    usage: '/deposit <amount|all>',
    category: 'economy',
  },
  {
    name: 'withdraw',
    description: 'Withdraw coins from your bank to your wallet.',
    usage: '/withdraw <amount|all>',
    category: 'economy',
  },
  {
    name: 'transfer',
    description: 'Send coins from your wallet to another user.',
    usage: '/transfer <user> <amount>',
    category: 'economy',
  },
  {
    name: 'daily',
    description: 'Claim your daily reward of $500.',
    usage: '/daily',
    category: 'economy',
    extra: 'Cooldown: 24 hours • Reward: $500',
  },
  {
    name: 'work',
    description: 'Work a job and earn coins.',
    usage: '/work',
    category: 'economy',
    extra: 'Cooldown: 1 hour • Reward: $50–$200 • +10 XP',
  },
  {
    name: 'beg',
    description: 'Beg for spare change from a kind stranger.',
    usage: '/beg',
    category: 'economy',
    extra: 'Cooldown: 30 minutes • Reward: $10–$50',
  },
  {
    name: 'crime',
    description: 'Commit a crime for big money — 40% chance of failure.',
    usage: '/crime',
    category: 'economy',
    extra: 'Cooldown: 2 hours • Reward: $30–$300 (or fine $20–$100) • +20 XP on success',
  },
  {
    name: 'rob',
    description: 'Attempt to rob another user (50% fail rate).',
    usage: '/rob <user>',
    category: 'economy',
    extra: 'Cooldown: 1 hour • Steals 10–50% of target wallet on success',
  },
  {
    name: 'mine',
    description: 'Go mining and dig up ore worth coins.',
    usage: '/mine',
    category: 'economy',
    extra: 'Cooldown: 30 minutes • Reward: $30–$180 • +10 XP',
  },
  {
    name: 'fish',
    description: 'Go fishing and catch fish worth coins.',
    usage: '/fish',
    category: 'economy',
    extra: 'Cooldown: 30 minutes • Reward: $20–$150 • +8 XP',
  },
  {
    name: 'hunt',
    description: 'Go hunting and sell your catch for coins.',
    usage: '/hunt',
    category: 'economy',
    extra: 'Cooldown: 30 minutes • Reward: $40–$180 • +12 XP',
  },
  {
    name: 'farm',
    description: 'Tend your farm and harvest crops worth coins.',
    usage: '/farm',
    category: 'economy',
    extra: 'Cooldown: 30 minutes • Reward: $25–$120 • +8 XP',
  },
  {
    name: 'forage',
    description: 'Forage the wilderness for items worth coins.',
    usage: '/forage',
    category: 'economy',
    extra: 'Cooldown: 30 minutes • Reward: $15–$80 • +6 XP',
  },
  {
    name: 'slots',
    description: 'Spin the slot machine and try your luck.',
    usage: '/slots [bet]',
    category: 'economy',
    extra: 'Bet: $10–$10,000 • Jackpot: 20x on 💎💎💎',
  },
  {
    name: 'blackjack',
    description: 'Play a game of blackjack against the dealer.',
    usage: '/blackjack [bet]',
    category: 'economy',
    extra: 'Bet: $10–$10,000 • Win pays 2x',
  },
  {
    name: 'roulette',
    description: 'Bet on a colour or number on the roulette wheel.',
    usage: '/roulette [bet] [choice]',
    category: 'economy',
    extra: 'Choices: red/black (2x), green (14x), number 0–36 (36x)',
  },
  {
    name: 'coinflip',
    description: 'Flip a coin — bet on heads or tails.',
    usage: '/coinflip [bet] [side]',
    category: 'economy',
    extra: 'Bet: $10–$10,000 • Win pays 2x',
  },
  {
    name: 'dice',
    description: 'Roll a dice — guess the number for a 5x payout.',
    usage: '/dice [bet] [number] [sides]',
    category: 'economy',
    extra: 'Exact guess: 5x • High roll (4–6): 2x • Free roll: no bet needed',
  },
  {
    name: 'shop',
    description: 'Browse the item shop grouped by rarity.',
    usage: '/shop',
    category: 'economy',
  },
  {
    name: 'buy',
    description: 'Buy an item from the shop.',
    usage: '/buy <item> [quantity]',
    category: 'economy',
  },
  {
    name: 'sell',
    description: 'Sell an item from your inventory back to the shop.',
    usage: '/sell <item> [quantity]',
    category: 'economy',
  },
  {
    name: 'inventory',
    description: "View your (or another user's) inventory.",
    usage: '/inventory [user]',
    category: 'economy',
  },
  {
    name: 'item-info',
    description: 'Get detailed information about a shop item.',
    usage: '/item-info <item>',
    category: 'economy',
  },
  {
    name: 'use',
    description: 'Use a usable item from your inventory.',
    usage: '/use <item>',
    category: 'economy',
  },
  {
    name: 'trade',
    description: 'Trade an item with another user.',
    usage: '/trade <user> <your_item> <their_item>',
    category: 'economy',
  },
  {
    name: 'net-worth',
    description: 'Check total net worth (wallet + bank + inventory).',
    usage: '/net-worth [user]',
    category: 'economy',
  },
  {
    name: 'richest',
    description: 'View the top 10 richest users by total wealth.',
    usage: '/richest',
    category: 'economy',
  },
  {
    name: 'leaderboard',
    description: 'View the server leaderboard (level, balance, or bank).',
    usage: '/leaderboard [type]',
    category: 'economy',
  },
  {
    name: 'pet-adopt',
    description: 'Adopt a pet companion (dog, cat, dragon, or phoenix).',
    usage: '/pet-adopt <pet_type> [name]',
    category: 'economy',
    extra: 'Costs: Dog/Cat $500 • Dragon $2,000 • Phoenix $5,000',
  },
  {
    name: 'pet-info',
    description: "View your pet's status (happiness, hunger, type).",
    usage: '/pet-info [user]',
    category: 'economy',
  },
  {
    name: 'pet-feed',
    description: 'Feed your pet to reduce hunger.',
    usage: '/pet-feed',
    category: 'economy',
    extra: 'Costs $50 per feeding',
  },
  {
    name: 'pet-play',
    description: 'Play with your pet to boost happiness.',
    usage: '/pet-play',
    category: 'economy',
    extra: 'Cooldown: 1 hour • +15 happiness',
  },
  {
    name: 'business-create',
    description: 'Create your own business.',
    usage: '/business-create <name>',
    category: 'economy',
    extra: 'Costs $1,000 to start',
  },
  {
    name: 'business-info',
    description: 'View your business info and collect pending earnings.',
    usage: '/business-info [user]',
    category: 'economy',
    extra: 'Earns $50 × level per hour (max 24 hrs pending)',
  },
  {
    name: 'business-upgrade',
    description: 'Upgrade your business to increase hourly earnings.',
    usage: '/business-upgrade',
    category: 'economy',
    extra: 'Cost: level × $500 • Max level: 10',
  },
  {
    name: 'achievements',
    description: "View a user's unlocked achievements.",
    usage: '/achievements [user]',
    category: 'economy',
  },
  {
    name: 'achievement-info',
    description: 'Get detailed info about a specific achievement.',
    usage: '/achievement-info <achievement>',
    category: 'economy',
  },

  // ── Fun ───────────────────────────────────────────────────────────────────
  {
    name: '8ball',
    description: 'Ask the magic 8ball a question.',
    usage: '/8ball <question>',
    category: 'fun',
  },
  { name: 'meme', description: 'Get a random meme.', usage: '/meme', category: 'fun' },
  { name: 'joke', description: 'Get a random joke.', usage: '/joke', category: 'fun' },
  { name: 'rps', description: 'Play rock paper scissors against the bot.', usage: '/rps <choice>', category: 'fun' },
  { name: 'tictactoe', description: 'Play tic tac toe against the bot.', usage: '/tictactoe', category: 'fun' },
  { name: 'connect4', description: 'Play Connect Four against the bot.', usage: '/connect4', category: 'fun' },
  { name: 'trivia', description: 'Answer a random trivia question.', usage: '/trivia', category: 'fun' },
  { name: 'hangman', description: 'Play a game of hangman.', usage: '/hangman', category: 'fun' },
  { name: 'minesweeper', description: 'Generate a minesweeper board.', usage: '/minesweeper [difficulty]', category: 'fun' },
  { name: 'guess-number', description: 'Guess the number the bot is thinking of.', usage: '/guess-number <guess>', category: 'fun' },
  { name: 'higher-lower', description: 'Play higher or lower.', usage: '/higher-lower', category: 'fun' },
  { name: 'would-you-rather', description: 'Get a would you rather question.', usage: '/would-you-rather', category: 'fun' },
  { name: 'truth-or-dare', description: 'Get a truth or dare prompt.', usage: '/truth-or-dare <type>', category: 'fun' },
  { name: 'quote', description: 'Get a random inspirational quote.', usage: '/quote', category: 'fun' },
  { name: 'fact', description: 'Get a random interesting fact.', usage: '/fact', category: 'fun' },
  { name: 'pickup-line', description: 'Get a random pickup line.', usage: '/pickup-line', category: 'fun' },
  { name: 'roast', description: 'Roast a user (all in good fun!).', usage: '/roast [user]', category: 'fun' },
  { name: 'compliment', description: 'Compliment a user.', usage: '/compliment [user]', category: 'fun' },
  { name: 'gif', description: 'Search for a GIF by keyword.', usage: '/gif <query>', category: 'fun' },
  { name: 'image', description: 'Search for an image by keyword.', usage: '/image <query>', category: 'fun' },
  { name: 'meme-search', description: 'Search for a meme template.', usage: '/meme-search <template>', category: 'fun' },

  // ── Music ─────────────────────────────────────────────────────────────────
  { name: 'play', description: 'Play a song in your voice channel.', usage: '/play <query>', category: 'music' },
  { name: 'pause', description: 'Pause the currently playing song.', usage: '/pause', category: 'music' },
  { name: 'resume', description: 'Resume the paused song.', usage: '/resume', category: 'music' },
  { name: 'stop', description: 'Stop music and clear the queue.', usage: '/stop', category: 'music' },
  { name: 'skip', description: 'Skip the current song.', usage: '/skip [amount]', category: 'music' },
  { name: 'previous', description: 'Play the previous song.', usage: '/previous', category: 'music' },
  { name: 'seek', description: 'Seek to a specific time in the current song.', usage: '/seek <time>', category: 'music' },
  { name: 'volume', description: 'Set the music volume.', usage: '/volume <level>', category: 'music' },
  { name: 'loop', description: 'Set the loop mode.', usage: '/loop <mode>', category: 'music' },
  { name: 'shuffle', description: 'Shuffle the music queue.', usage: '/shuffle', category: 'music' },
  { name: 'queue', description: 'View the current music queue.', usage: '/queue', category: 'music' },
  { name: 'queue-clear', description: 'Clear the music queue.', usage: '/queue-clear', category: 'music' },
  { name: 'queue-remove', description: 'Remove a song from the queue.', usage: '/queue-remove <position>', category: 'music' },
  { name: 'queue-move', description: 'Move a song in the queue.', usage: '/queue-move <from> <to>', category: 'music' },
  { name: 'now-playing', description: 'Show the currently playing song.', usage: '/now-playing', category: 'music' },
  { name: 'lyrics', description: 'Get lyrics for a song.', usage: '/lyrics [song]', category: 'music' },
  { name: 'search', description: 'Search for songs to add to the queue.', usage: '/search <query>', category: 'music' },
  { name: 'playlist', description: 'Manage your playlists.', usage: '/playlist <create|list|play>', category: 'music' },

  // ── Leveling ──────────────────────────────────────────────────────────────
  {
    name: 'level',
    description: 'Check your current level and XP progress.',
    usage: '/level [user]',
    category: 'leveling',
  },

  // ── Moderation ────────────────────────────────────────────────────────────
  {
    name: 'ban',
    description: 'Ban a user from the server.',
    usage: '/ban <user> [reason]',
    category: 'moderation',
    extra: 'Requires: Ban Members',
  },
  {
    name: 'unban',
    description: 'Unban a user by their ID.',
    usage: '/unban <user_id> [reason]',
    category: 'moderation',
    extra: 'Requires: Ban Members',
  },
  {
    name: 'kick',
    description: 'Kick a user from the server.',
    usage: '/kick <user> [reason]',
    category: 'moderation',
    extra: 'Requires: Kick Members',
  },
  {
    name: 'mute',
    description: 'Timeout (mute) a user for a set duration.',
    usage: '/mute <user> <duration> [reason]',
    category: 'moderation',
    extra: 'Duration format: 10m, 1h, 7d (max 28d) • Requires: Moderate Members',
  },
  {
    name: 'unmute',
    description: 'Remove a timeout from a user.',
    usage: '/unmute <user>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'timeout',
    description: 'Timeout a user (alias for /mute).',
    usage: '/timeout <user> <duration> [reason]',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'warn',
    description: 'Issue a warning to a user.',
    usage: '/warn <user> [reason]',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'warnings',
    description: "View all warnings for a user.",
    usage: '/warnings <user>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'clear-warnings',
    description: "Clear all warnings for a user.",
    usage: '/clear-warnings <user>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'purge',
    description: 'Bulk-delete messages from the current channel.',
    usage: '/purge <amount>',
    category: 'moderation',
    extra: 'Range: 1–100 messages • Requires: Manage Messages',
  },
  {
    name: 'purge-user',
    description: "Delete a specific user's recent messages.",
    usage: '/purge-user <user> <amount>',
    category: 'moderation',
    extra: 'Scans up to 100 messages • Requires: Manage Messages',
  },
  {
    name: 'purge-contains',
    description: 'Delete messages containing specific text.',
    usage: '/purge-contains <text> <amount>',
    category: 'moderation',
    extra: 'Requires: Manage Messages',
  },
  {
    name: 'lockdown',
    description: 'Lock the current channel so no one can send messages.',
    usage: '/lockdown [duration]',
    category: 'moderation',
    extra: 'Optional auto-unlock duration (e.g. 10m, 1h) • Requires: Manage Channels',
  },
  {
    name: 'unlock',
    description: 'Unlock the current channel.',
    usage: '/unlock',
    category: 'moderation',
    extra: 'Requires: Manage Channels',
  },
  {
    name: 'slowmode',
    description: 'Set the slowmode delay for the current channel.',
    usage: '/slowmode <seconds>',
    category: 'moderation',
    extra: 'Range: 0 (off) – 21600 seconds • Requires: Manage Channels',
  },
  {
    name: 'nickname',
    description: "Change a user's server nickname.",
    usage: '/nickname <user> <nickname>',
    category: 'moderation',
    extra: 'Requires: Manage Nicknames',
  },
  {
    name: 'remove-nickname',
    description: "Remove a user's server nickname.",
    usage: '/remove-nickname <user>',
    category: 'moderation',
    extra: 'Requires: Manage Nicknames',
  },
  {
    name: 'modlog',
    description: "View a user's moderation history.",
    usage: '/modlog <user>',
    category: 'moderation',
    extra: 'Shows last 20 actions • Requires: Moderate Members',
  },
  {
    name: 'audit-log',
    description: 'View the server moderation audit log.',
    usage: '/audit-log [user] [action] [limit]',
    category: 'moderation',
    extra: 'Filterable by user and action type • Requires: View Audit Log',
  },
  {
    name: 'add-note',
    description: 'Add a private moderator note to a member.',
    usage: '/add-note <user> <note>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'member-notes',
    description: 'View all moderator notes on a member.',
    usage: '/member-notes <user>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'remove-note',
    description: 'Remove a moderator note from a member.',
    usage: '/remove-note <user> <note_id>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'member-info',
    description: 'Get detailed information about a server member.',
    usage: '/member-info <user>',
    category: 'moderation',
    extra: 'Shows roles, join date, mod actions, warnings • Requires: Moderate Members',
  },
  {
    name: 'member-list',
    description: 'List server members, optionally filtered by role.',
    usage: '/member-list [role]',
    category: 'moderation',
    extra: 'Shows up to 50 members • Requires: Moderate Members',
  },
  {
    name: 'channel-info',
    description: 'Get information about a channel.',
    usage: '/channel-info [channel]',
    category: 'moderation',
    extra: 'Requires: Manage Channels',
  },
  {
    name: 'channel-create',
    description: 'Create a new text, voice, or announcement channel.',
    usage: '/channel-create <name> [type]',
    category: 'moderation',
    extra: 'Requires: Manage Channels',
  },
  {
    name: 'channel-delete',
    description: 'Delete a channel.',
    usage: '/channel-delete <channel>',
    category: 'moderation',
    extra: 'Requires: Manage Channels',
  },
  {
    name: 'channel-rename',
    description: 'Rename a channel.',
    usage: '/channel-rename <channel> <new_name>',
    category: 'moderation',
    extra: 'Requires: Manage Channels',
  },
  {
    name: 'role-info',
    description: 'Get information about a role.',
    usage: '/role-info <role>',
    category: 'moderation',
    extra: 'Requires: Manage Roles',
  },
  {
    name: 'role-create',
    description: 'Create a new role.',
    usage: '/role-create <name> [color]',
    category: 'moderation',
    extra: 'Requires: Manage Roles',
  },
  {
    name: 'role-delete',
    description: 'Delete a role.',
    usage: '/role-delete <role>',
    category: 'moderation',
    extra: 'Requires: Manage Roles',
  },
  {
    name: 'role-rename',
    description: 'Rename a role.',
    usage: '/role-rename <role> <new_name>',
    category: 'moderation',
    extra: 'Requires: Manage Roles',
  },
  {
    name: 'role-color',
    description: 'Change the color of a role.',
    usage: '/role-color <role> <color>',
    category: 'moderation',
    extra: 'Color format: #rrggbb • Requires: Manage Roles',
  },
  {
    name: 'role-position',
    description: 'Change the position of a role in the hierarchy.',
    usage: '/role-position <role> <position>',
    category: 'moderation',
    extra: 'Requires: Manage Roles',
  },
  {
    name: 'emoji-info',
    description: 'Get information about a server emoji.',
    usage: '/emoji-info <emoji>',
    category: 'moderation',
    extra: 'Requires: Manage Emojis',
  },
  {
    name: 'emoji-list',
    description: 'List all custom emojis in the server.',
    usage: '/emoji-list',
    category: 'moderation',
    extra: 'Requires: Manage Emojis',
  },
  {
    name: 'anti-spam',
    description: 'Enable or disable anti-spam protection.',
    usage: '/anti-spam <enable|disable>',
    category: 'moderation',
    extra: 'Requires: Manage Server',
  },
  {
    name: 'anti-raid',
    description: 'Enable or disable anti-raid protection.',
    usage: '/anti-raid <enable|disable>',
    category: 'moderation',
    extra: 'Requires: Manage Server',
  },
  {
    name: 'anti-link',
    description: 'Enable or disable anti-link protection.',
    usage: '/anti-link <enable|disable>',
    category: 'moderation',
    extra: 'Requires: Manage Server',
  },
  {
    name: 'anti-nuke',
    description: 'Enable or disable anti-nuke protection.',
    usage: '/anti-nuke <enable|disable>',
    category: 'moderation',
    extra: 'Requires: Manage Server',
  },
  {
    name: 'spam-threshold',
    description: 'Set the spam detection threshold (messages per 5 seconds).',
    usage: '/spam-threshold <number>',
    category: 'moderation',
    extra: 'Range: 2–20 • Requires: Manage Server',
  },
  {
    name: 'raid-threshold',
    description: 'Set the raid detection threshold (joins per 10 seconds).',
    usage: '/raid-threshold <number>',
    category: 'moderation',
    extra: 'Range: 2–50 • Requires: Manage Server',
  },
  {
    name: 'appeal',
    description: 'Submit an appeal for a punishment.',
    usage: '/appeal <reason>',
    category: 'moderation',
  },
  {
    name: 'appeals',
    description: 'View all pending punishment appeals.',
    usage: '/appeals',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'approve-appeal',
    description: 'Approve a punishment appeal by ID.',
    usage: '/approve-appeal <appeal_id>',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },
  {
    name: 'deny-appeal',
    description: 'Deny a punishment appeal by ID.',
    usage: '/deny-appeal <appeal_id> [reason]',
    category: 'moderation',
    extra: 'Requires: Moderate Members',
  },

  // ── Utility ───────────────────────────────────────────────────────────────
  {
    name: 'ping',
    description: 'Check bot latency and API response time.',
    usage: '/ping',
    category: 'utility',
  },
  {
    name: 'serverinfo',
    description: 'Get detailed information about the server.',
    usage: '/serverinfo',
    category: 'utility',
  },
  {
    name: 'userinfo',
    description: 'Get information about a user.',
    usage: '/userinfo [user]',
    category: 'utility',
  },
  {
    name: 'help',
    description: 'Show this help menu.',
    usage: '/help [category] [command]',
    category: 'utility',
  },
  {
    name: 'verify setup',
    description: 'Configure the Roblox verification system (verified/unverified roles, channel).',
    usage: '/verify setup',
    category: 'utility',
    extra: 'Requires: Manage Server',
  },
  {
    name: 'verify user',
    description: 'Verify your Roblox account and receive the verified role.',
    usage: '/verify user <roblox_username>',
    category: 'utility',
  },
  { name: 'avatar', description: 'Get a user\'s avatar.', usage: '/avatar [user]', category: 'utility' },
  { name: 'banner', description: 'Get a user\'s profile banner.', usage: '/banner [user]', category: 'utility' },
  { name: 'bot-stats', description: 'View detailed bot statistics.', usage: '/bot-stats', category: 'utility' },
  { name: 'uptime', description: 'Check how long the bot has been online.', usage: '/uptime', category: 'utility' },
  { name: 'weather', description: 'Get the current weather for a location.', usage: '/weather <location>', category: 'utility' },
  { name: 'calculator', description: 'Evaluate a mathematical expression.', usage: '/calculator <expression>', category: 'utility' },
  { name: 'unit-convert', description: 'Convert between units of measurement.', usage: '/unit-convert <value> <conversion>', category: 'utility' },
  { name: 'qr-code', description: 'Generate a QR code for any text or URL.', usage: '/qr-code <text>', category: 'utility' },
  { name: 'translate', description: 'Translate text to another language.', usage: '/translate <text> <language>', category: 'utility' },
  { name: 'time', description: 'Get the current time in a timezone.', usage: '/time [timezone]', category: 'utility' },
  { name: 'define', description: 'Define a word using the dictionary.', usage: '/define <word>', category: 'utility' },
  { name: 'reverse-image', description: 'Get reverse image search links.', usage: '/reverse-image <url>', category: 'utility' },

  // ── Tickets ───────────────────────────────────────────────────────────────
  { name: 'ticket-create', description: 'Create a support ticket.', usage: '/ticket-create [reason]', category: 'tickets' },
  { name: 'ticket-close', description: 'Close the current ticket.', usage: '/ticket-close [reason]', category: 'tickets' },
  { name: 'ticket-add', description: 'Add a user to the current ticket.', usage: '/ticket-add <user>', category: 'tickets' },
  { name: 'ticket-remove', description: 'Remove a user from the current ticket.', usage: '/ticket-remove <user>', category: 'tickets' },
  { name: 'ticket-rename', description: 'Rename the current ticket channel.', usage: '/ticket-rename <name>', category: 'tickets' },
  { name: 'ticket-config', description: 'Configure the ticket system.', usage: '/ticket-config', category: 'tickets', extra: 'Requires: Manage Server' },
  { name: 'tickets', description: 'View your open tickets.', usage: '/tickets', category: 'tickets' },
  { name: 'ticket-logs', description: 'View ticket logs for this server.', usage: '/ticket-logs', category: 'tickets', extra: 'Requires: Manage Server' },

  // ── Reaction Roles ────────────────────────────────────────────────────────
  { name: 'reaction-role-add', description: 'Add a reaction role to a message.', usage: '/reaction-role-add <message_id> <emoji> <role>', category: 'roles', extra: 'Requires: Manage Roles' },
  { name: 'reaction-role-remove', description: 'Remove a reaction role from a message.', usage: '/reaction-role-remove <message_id> <emoji>', category: 'roles', extra: 'Requires: Manage Roles' },
  { name: 'reaction-role-list', description: 'List all reaction roles in this server.', usage: '/reaction-role-list', category: 'roles', extra: 'Requires: Manage Roles' },
  { name: 'reaction-role-config', description: 'Configure the reaction role system.', usage: '/reaction-role-config <enabled>', category: 'roles', extra: 'Requires: Manage Server' },
  { name: 'reaction-role-test', description: 'Test a reaction role configuration.', usage: '/reaction-role-test <message_id>', category: 'roles', extra: 'Requires: Manage Roles' },

  // ── Polls & Giveaways ─────────────────────────────────────────────────────
  { name: 'poll', description: 'Create a poll.', usage: '/poll <question> <options>', category: 'giveaways' },
  { name: 'poll-results', description: 'View the results of a poll.', usage: '/poll-results <message_id>', category: 'giveaways' },
  { name: 'poll-end', description: 'End a poll early.', usage: '/poll-end <message_id>', category: 'giveaways', extra: 'Requires: Manage Messages' },
  { name: 'giveaway-create', description: 'Create a giveaway.', usage: '/giveaway-create <prize> <duration> [winners]', category: 'giveaways', extra: 'Requires: Manage Server' },
  { name: 'giveaway-end', description: 'End a giveaway early and pick winners.', usage: '/giveaway-end <message_id>', category: 'giveaways', extra: 'Requires: Manage Server' },
  { name: 'giveaway-reroll', description: 'Reroll the winners of an ended giveaway.', usage: '/giveaway-reroll <message_id>', category: 'giveaways', extra: 'Requires: Manage Server' },
  { name: 'giveaways', description: 'View active giveaways in this server.', usage: '/giveaways', category: 'giveaways' },
  { name: 'giveaway-logs', description: 'View giveaway history for this server.', usage: '/giveaway-logs', category: 'giveaways', extra: 'Requires: Manage Server' },

  // ── Reminders ─────────────────────────────────────────────────────────────
  { name: 'remind', description: 'Set a reminder.', usage: '/remind <time> <message>', category: 'reminders' },
  { name: 'reminders', description: 'View your active reminders.', usage: '/reminders', category: 'reminders' },
  { name: 'remove-reminder', description: 'Remove a reminder by ID.', usage: '/remove-reminder <id>', category: 'reminders' },
  { name: 'edit-reminder', description: 'Edit an existing reminder.', usage: '/edit-reminder <id> <message>', category: 'reminders' },
  { name: 'reminder-config', description: 'Configure the reminder system.', usage: '/reminder-config', category: 'reminders', extra: 'Requires: Manage Server' },

  // ── Suggestions ───────────────────────────────────────────────────────────
  { name: 'suggest', description: 'Submit a suggestion for the server.', usage: '/suggest <suggestion>', category: 'suggestions' },
  { name: 'suggestions', description: 'View suggestions for this server.', usage: '/suggestions [status]', category: 'suggestions' },
  { name: 'suggestion-approve', description: 'Approve a suggestion.', usage: '/suggestion-approve <id> [reason]', category: 'suggestions', extra: 'Requires: Manage Server' },
  { name: 'suggestion-deny', description: 'Deny a suggestion.', usage: '/suggestion-deny <id> [reason]', category: 'suggestions', extra: 'Requires: Manage Server' },
  { name: 'suggestion-config', description: 'Configure the suggestion system.', usage: '/suggestion-config', category: 'suggestions', extra: 'Requires: Manage Server' },

  // ── Starboard ─────────────────────────────────────────────────────────────
  { name: 'starboard-config', description: 'Configure the starboard.', usage: '/starboard-config', category: 'starboard', extra: 'Requires: Manage Server' },
  { name: 'starboard', description: 'View the top starred messages.', usage: '/starboard', category: 'starboard' },
  { name: 'star-message', description: 'Manually star a message.', usage: '/star-message <message_id>', category: 'starboard' },
  { name: 'unstar-message', description: 'Remove a message from the starboard.', usage: '/unstar-message <message_id>', category: 'starboard' },
  { name: 'starboard-logs', description: 'View starboard activity logs.', usage: '/starboard-logs', category: 'starboard', extra: 'Requires: Manage Server' },

  // ── AFK ───────────────────────────────────────────────────────────────────
  { name: 'afk', description: 'Set your AFK status.', usage: '/afk [reason]', category: 'afk' },
  { name: 'afk-remove', description: 'Remove a user\'s AFK status.', usage: '/afk-remove [user]', category: 'afk' },
  { name: 'afk-list', description: 'View all AFK members in this server.', usage: '/afk-list', category: 'afk' },
  { name: 'afk-config', description: 'Configure the AFK system.', usage: '/afk-config <enabled>', category: 'afk', extra: 'Requires: Manage Server' },
  { name: 'afk-logs', description: 'View AFK activity logs.', usage: '/afk-logs', category: 'afk', extra: 'Requires: Manage Server' },

  // ── Temp Voice ────────────────────────────────────────────────────────────
  { name: 'temp-voice-create', description: 'Create a temporary voice channel.', usage: '/temp-voice-create [name] [limit]', category: 'voice' },
  { name: 'temp-voice-delete', description: 'Delete your temporary voice channel.', usage: '/temp-voice-delete', category: 'voice' },
  { name: 'temp-voice-config', description: 'Configure the temp voice system.', usage: '/temp-voice-config', category: 'voice', extra: 'Requires: Manage Server' },
  { name: 'temp-voice-list', description: 'List all active temporary voice channels.', usage: '/temp-voice-list', category: 'voice' },
  { name: 'temp-voice-logs', description: 'View temp voice channel activity logs.', usage: '/temp-voice-logs', category: 'voice', extra: 'Requires: Manage Server' },

  // ── Auto Responses ────────────────────────────────────────────────────────
  { name: 'auto-response-add', description: 'Add an automatic response trigger.', usage: '/auto-response-add <trigger> <response>', category: 'auto', extra: 'Requires: Manage Server' },
  { name: 'auto-response-remove', description: 'Remove an auto response by trigger.', usage: '/auto-response-remove <trigger>', category: 'auto', extra: 'Requires: Manage Server' },
  { name: 'auto-response-list', description: 'List all auto responses for this server.', usage: '/auto-response-list', category: 'auto', extra: 'Requires: Manage Server' },
  { name: 'auto-response-config', description: 'Configure the auto response system.', usage: '/auto-response-config <enabled>', category: 'auto', extra: 'Requires: Manage Server' },
  { name: 'auto-response-test', description: 'Test if a message would trigger an auto response.', usage: '/auto-response-test <message>', category: 'auto', extra: 'Requires: Manage Server' },

  // ── Counting ──────────────────────────────────────────────────────────────
  { name: 'counting-channel', description: 'Set the counting channel.', usage: '/counting-channel <channel>', category: 'counting', extra: 'Requires: Manage Server' },
  { name: 'counting-reset', description: 'Reset the counting channel back to 0.', usage: '/counting-reset', category: 'counting', extra: 'Requires: Manage Server' },
  { name: 'counting-stats', description: 'View counting channel statistics.', usage: '/counting-stats', category: 'counting' },
  { name: 'counting-config', description: 'Configure the counting channel.', usage: '/counting-config', category: 'counting', extra: 'Requires: Manage Server' },
  { name: 'counting-logs', description: 'View counting channel logs.', usage: '/counting-logs', category: 'counting', extra: 'Requires: Manage Server' },

  // ── Confessions ───────────────────────────────────────────────────────────
  { name: 'confess', description: 'Submit an anonymous confession.', usage: '/confess <confession>', category: 'confessions' },
  { name: 'confessions', description: 'View approved confessions.', usage: '/confessions [status]', category: 'confessions' },
  { name: 'confession-approve', description: 'Approve a confession.', usage: '/confession-approve <id>', category: 'confessions', extra: 'Requires: Manage Server' },
  { name: 'confession-deny', description: 'Deny a confession.', usage: '/confession-deny <id>', category: 'confessions', extra: 'Requires: Manage Server' },
  { name: 'confession-config', description: 'Configure the confession system.', usage: '/confession-config', category: 'confessions', extra: 'Requires: Manage Server' },

  // ── Birthdays ─────────────────────────────────────────────────────────────
  { name: 'birthday-set', description: 'Set your birthday.', usage: '/birthday-set <day> <month> [year]', category: 'birthdays' },
  { name: 'birthday-remove', description: 'Remove your birthday from the bot.', usage: '/birthday-remove', category: 'birthdays' },
  { name: 'birthdays', description: 'View upcoming birthdays in this server.', usage: '/birthdays', category: 'birthdays' },
  { name: 'birthday-config', description: 'Configure birthday announcements.', usage: '/birthday-config', category: 'birthdays', extra: 'Requires: Manage Server' },
  { name: 'birthday-logs', description: 'View birthday announcement logs.', usage: '/birthday-logs', category: 'birthdays', extra: 'Requires: Manage Server' },

  // ── Embed Builder ─────────────────────────────────────────────────────────
  { name: 'embed-create', description: 'Create a custom embed.', usage: '/embed-create <title>', category: 'embeds', extra: 'Requires: Manage Messages' },
  { name: 'embed-edit', description: 'Edit an existing embed message.', usage: '/embed-edit <message_id>', category: 'embeds', extra: 'Requires: Manage Messages' },
  { name: 'embed-delete', description: 'Delete an embed message.', usage: '/embed-delete <message_id>', category: 'embeds', extra: 'Requires: Manage Messages' },
  { name: 'embed-preview', description: 'Preview an embed before sending.', usage: '/embed-preview <title>', category: 'embeds', extra: 'Requires: Manage Messages' },
  { name: 'embed-send', description: 'Send an embed to a specific channel.', usage: '/embed-send <channel> <title>', category: 'embeds', extra: 'Requires: Manage Messages' },

  // ── Backups ───────────────────────────────────────────────────────────────
  { name: 'backup-create', description: 'Create a backup of the server configuration.', usage: '/backup-create [name]', category: 'backups', extra: 'Requires: Administrator' },
  { name: 'backup-list', description: 'List all server backups.', usage: '/backup-list', category: 'backups', extra: 'Requires: Administrator' },
  { name: 'backup-restore', description: 'Restore a server backup.', usage: '/backup-restore <id>', category: 'backups', extra: 'Requires: Administrator' },
  { name: 'backup-delete', description: 'Delete a server backup.', usage: '/backup-delete <id>', category: 'backups', extra: 'Requires: Administrator' },
  { name: 'backup-info', description: 'View information about a backup.', usage: '/backup-info <id>', category: 'backups', extra: 'Requires: Administrator' },

  // ── Message Sniping ───────────────────────────────────────────────────────
  { name: 'snipe', description: 'View the last deleted message in this channel.', usage: '/snipe', category: 'sniping' },
  { name: 'snipe-edit', description: 'View the last edited message in this channel.', usage: '/snipe-edit', category: 'sniping' },
  { name: 'snipe-config', description: 'Configure the message sniping system.', usage: '/snipe-config <enabled>', category: 'sniping', extra: 'Requires: Manage Server' },
  { name: 'snipe-logs', description: 'View snipe activity logs.', usage: '/snipe-logs', category: 'sniping', extra: 'Requires: Manage Server' },
  { name: 'snipe-clear', description: 'Clear the snipe cache for this channel.', usage: '/snipe-clear', category: 'sniping', extra: 'Requires: Manage Messages' },

  // ── Sticky Messages ───────────────────────────────────────────────────────
  { name: 'sticky-add', description: 'Add a sticky message to this channel.', usage: '/sticky-add <message>', category: 'sticky', extra: 'Requires: Manage Messages' },
  { name: 'sticky-remove', description: 'Remove the sticky message from this channel.', usage: '/sticky-remove', category: 'sticky', extra: 'Requires: Manage Messages' },
  { name: 'sticky-list', description: 'List all sticky messages in this server.', usage: '/sticky-list', category: 'sticky', extra: 'Requires: Manage Messages' },
  { name: 'sticky-config', description: 'Configure sticky message behaviour.', usage: '/sticky-config', category: 'sticky', extra: 'Requires: Manage Server' },
  { name: 'sticky-logs', description: 'View sticky message activity logs.', usage: '/sticky-logs', category: 'sticky', extra: 'Requires: Manage Server' },

  // ── Invite Tracking ───────────────────────────────────────────────────────
  { name: 'invites', description: 'View invite statistics for a user.', usage: '/invites [user]', category: 'invites' },
  { name: 'invite-info', description: 'Get information about an invite code.', usage: '/invite-info <code>', category: 'invites' },
  { name: 'invite-logs', description: 'View invite tracking logs.', usage: '/invite-logs', category: 'invites', extra: 'Requires: Manage Server' },
  { name: 'invite-config', description: 'Configure invite tracking.', usage: '/invite-config <enabled>', category: 'invites', extra: 'Requires: Manage Server' },
  { name: 'invite-reset', description: 'Reset invite count for a user.', usage: '/invite-reset <user>', category: 'invites', extra: 'Requires: Manage Server' },

  // ── Welcome & Goodbye ─────────────────────────────────────────────────────
  { name: 'welcome-message', description: 'Set the welcome message for new members.', usage: '/welcome-message <message>', category: 'welcome', extra: 'Requires: Manage Server' },
  { name: 'welcome-channel', description: 'Set the channel for welcome messages.', usage: '/welcome-channel <channel>', category: 'welcome', extra: 'Requires: Manage Server' },
  { name: 'goodbye-message', description: 'Set the goodbye message for leaving members.', usage: '/goodbye-message <message>', category: 'welcome', extra: 'Requires: Manage Server' },
  { name: 'goodbye-channel', description: 'Set the channel for goodbye messages.', usage: '/goodbye-channel <channel>', category: 'welcome', extra: 'Requires: Manage Server' },
  { name: 'welcome-test', description: 'Test the welcome message.', usage: '/welcome-test', category: 'welcome', extra: 'Requires: Manage Server' },

  // ── Logging ───────────────────────────────────────────────────────────────
  { name: 'logs', description: 'View recent server logs.', usage: '/logs [type]', category: 'logging', extra: 'Requires: View Audit Log' },
  { name: 'log-config', description: 'Configure the logging system.', usage: '/log-config', category: 'logging', extra: 'Requires: Manage Server' },
  { name: 'message-logs', description: 'View recent message edit/delete logs.', usage: '/message-logs [channel]', category: 'logging', extra: 'Requires: Manage Messages' },
  { name: 'join-logs', description: 'View recent member join logs.', usage: '/join-logs', category: 'logging', extra: 'Requires: Manage Server' },
  { name: 'leave-logs', description: 'View recent member leave logs.', usage: '/leave-logs', category: 'logging', extra: 'Requires: Manage Server' },
  { name: 'ban-logs', description: 'View recent ban logs.', usage: '/ban-logs', category: 'logging', extra: 'Requires: Ban Members' },
  { name: 'kick-logs', description: 'View recent kick logs.', usage: '/kick-logs', category: 'logging', extra: 'Requires: Kick Members' },
  { name: 'warn-logs', description: 'View recent warning logs.', usage: '/warn-logs [user]', category: 'logging', extra: 'Requires: Moderate Members' },

  // ── Administration ────────────────────────────────────────────────────────
  { name: 'settings', description: 'View all server settings.', usage: '/settings', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'settings-update', description: 'Update a server setting.', usage: '/settings-update <setting> <value>', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'prefix', description: 'Change the bot prefix for this server.', usage: '/prefix <prefix>', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'language', description: 'Set the bot language for this server.', usage: '/language <language>', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'permissions', description: 'View or check permissions for a role or user.', usage: '/permissions [role] [user]', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'cooldown', description: 'Set a custom cooldown for a command.', usage: '/cooldown <command> <seconds>', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'disable-command', description: 'Disable a command in this server.', usage: '/disable-command <command>', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'enable-command', description: 'Re-enable a disabled command in this server.', usage: '/enable-command <command>', category: 'admin', extra: 'Requires: Manage Server' },
  { name: 'command-list', description: 'List all commands and their status.', usage: '/command-list', category: 'admin', extra: 'Requires: Manage Server' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return all commands for a given category key. */
function getCommandsByCategory(categoryKey) {
  return COMMAND_REGISTRY.filter(c => c.category === categoryKey);
}

/** Find a command by exact name (case-insensitive). */
function findCommand(name) {
  return COMMAND_REGISTRY.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
}

/** Find a category key by label or key (case-insensitive). */
function findCategory(input) {
  const lower = input.toLowerCase();
  return Object.entries(CATEGORIES).find(
    ([key, meta]) => key === lower || meta.label.toLowerCase() === lower
  ) || null;
}

/** Search commands by keyword across name and description. */
function searchCommands(keyword) {
  const lower = keyword.toLowerCase();
  return COMMAND_REGISTRY.filter(
    c => c.name.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
  );
}

// ─── Embed builders ───────────────────────────────────────────────────────────

/** Main overview embed — one field per category. */
function buildMainEmbed(client) {
  const totalCommands = COMMAND_REGISTRY.length;

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('📖 California Utilities — Help')
    .setDescription(
      'Use `/help [category]` to see all commands in a category.\n' +
      'Use `/help [command]` to get detailed info about a specific command.\n\n' +
      '**Available Categories**'
    )
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter({ text: `${totalCommands} commands total • /help <category|command>` })
    .setTimestamp();

  for (const [key, meta] of Object.entries(CATEGORIES)) {
    const cmds = getCommandsByCategory(key);
    embed.addFields({
      name: `${meta.emoji} ${meta.label} (${cmds.length})`,
      value: meta.description,
      inline: false,
    });
  }

  return embed;
}

/** Category embed — lists every command in the category. */
function buildCategoryEmbed(categoryKey, meta, page = 0) {
  const commands = getCommandsByCategory(categoryKey);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(commands.length / PAGE_SIZE);
  const slice = commands.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const lines = slice.map(c => `\`/${c.name}\` — ${c.description}`).join('\n');

  const embed = new EmbedBuilder()
    .setColor(meta.color)
    .setTitle(`${meta.emoji} ${meta.label} Commands (${commands.length})`)
    .setDescription(lines || 'No commands found.')
    .setFooter({
      text: totalPages > 1
        ? `Page ${page + 1}/${totalPages} • Use the buttons to navigate`
        : `${commands.length} command${commands.length !== 1 ? 's' : ''}`,
    })
    .setTimestamp();

  return { embed, totalPages };
}

/** Single-command detail embed. */
function buildCommandEmbed(cmd) {
  const meta = CATEGORIES[cmd.category];

  const embed = new EmbedBuilder()
    .setColor(meta?.color ?? 0x5865F2)
    .setTitle(`${meta?.emoji ?? '🔧'} /${cmd.name}`)
    .addFields(
      { name: '📝 Description', value: cmd.description, inline: false },
      { name: '📌 Usage', value: `\`${cmd.usage}\``, inline: false },
      { name: '📂 Category', value: `${meta?.emoji ?? ''} ${meta?.label ?? cmd.category}`, inline: true },
    );

  if (cmd.extra) {
    embed.addFields({ name: '💡 Details', value: cmd.extra, inline: false });
  }

  embed.setFooter({ text: 'Angle brackets <> = required • Square brackets [] = optional' })
    .setTimestamp();

  return embed;
}

/** Search results embed. */
function buildSearchEmbed(keyword, results) {
  const lines = results.map(c => {
    const meta = CATEGORIES[c.category];
    return `${meta?.emoji ?? '🔧'} \`/${c.name}\` — ${c.description}`;
  }).join('\n');

  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🔍 Search results for "${keyword}"`)
    .setDescription(results.length > 0 ? lines : 'No commands matched your search.')
    .setFooter({ text: `${results.length} result${results.length !== 1 ? 's' : ''} found` })
    .setTimestamp();
}

// ─── Pagination buttons ───────────────────────────────────────────────────────

function buildPaginationRow(page, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_prev')
      .setLabel('◀ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('help_next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
  );
}

// ─── Command export ───────────────────────────────────────────────────────────

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Browse all commands by category or search for a specific command')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Category to browse (economy, fun, moderation, leveling, utility)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('Get detailed info about a specific command')
        .setRequired(false)
    ),

  name: 'help',
  description: 'Browse all commands by category or search for a specific command',

  async execute(interaction, args, client) {
    // ── Detect slash vs prefix ───────────────────────────────────────────────
    // Slash commands: execute(interaction, client)
    // Prefix commands: execute(message, args, client)
    const isSlash = typeof interaction.isCommand === 'function' && interaction.isCommand();

    // Normalise the third argument: for slash commands the second positional
    // argument is `client`, so we reassign accordingly.
    if (isSlash) {
      client = args; // args holds `client` when called as a slash command
      args = [];
    }

    let categoryInput, commandInput;

    if (isSlash) {
      categoryInput = interaction.options.getString('category');
      commandInput  = interaction.options.getString('command');
    } else {
      // Prefix: first arg is category-or-command, second arg (if present) is command
      categoryInput = args[0] ?? null;
      commandInput  = args[1] ?? null;

      // If only one arg is given, check whether it matches a command name first
      if (categoryInput && !commandInput) {
        const maybeCmd = findCommand(categoryInput);
        if (maybeCmd) {
          commandInput  = categoryInput;
          categoryInput = null;
        }
      }
    }

    // Helper: send a reply that works for both slash and prefix contexts
    const send = (payload) => {
      if (isSlash) {
        // Strip ephemeral for prefix (not supported), but keep it for slash
        return interaction.reply(payload);
      }
      // For prefix commands, send to the channel; ignore ephemeral flag
      const { embeds, content, components } = payload;
      return interaction.channel.send({ embeds, content, components });
    };

    // ── Command detail view ──────────────────────────────────────────────────
    if (commandInput) {
      const cmd = findCommand(commandInput);

      if (!cmd) {
        // Try a keyword search as a fallback
        const results = searchCommands(commandInput);
        const embed = buildSearchEmbed(commandInput, results);
        return send({ embeds: [embed], ephemeral: true });
      }

      return send({ embeds: [buildCommandEmbed(cmd)] });
    }

    // ── Category view ────────────────────────────────────────────────────────
    if (categoryInput) {
      const found = findCategory(categoryInput);

      if (!found) {
        // Treat the input as a keyword search
        const results = searchCommands(categoryInput);
        const embed = buildSearchEmbed(categoryInput, results);
        return send({ embeds: [embed], ephemeral: true });
      }

      const [categoryKey, meta] = found;
      let page = 0;
      const { embed, totalPages } = buildCategoryEmbed(categoryKey, meta, page);

      // No pagination needed
      if (totalPages <= 1) {
        return send({ embeds: [embed] });
      }

      // Send with pagination buttons
      const row = buildPaginationRow(page, totalPages);

      let reply;
      if (isSlash) {
        reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
      } else {
        reply = await interaction.channel.send({ embeds: [embed], components: [row] });
      }

      const collectorFilter = isSlash
        ? i => i.user.id === interaction.user.id
        : i => i.user.id === interaction.author.id;

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: collectorFilter,
        time: 120_000, // 2 minutes
      });

      collector.on('collect', async i => {
        if (i.customId === 'help_prev') page = Math.max(0, page - 1);
        if (i.customId === 'help_next') page = Math.min(totalPages - 1, page + 1);

        const { embed: newEmbed } = buildCategoryEmbed(categoryKey, meta, page);
        const newRow = buildPaginationRow(page, totalPages);
        await i.update({ embeds: [newEmbed], components: [newRow] });
      });

      collector.on('end', async () => {
        // Disable buttons when collector expires
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('help_prev')
            .setLabel('◀ Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_next')
            .setLabel('Next ▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        );
        await reply.edit({ components: [disabledRow] }).catch(() => {});
      });

      return;
    }

    // ── Main overview ────────────────────────────────────────────────────────
    return send({ embeds: [buildMainEmbed(client)] });
  },
};
