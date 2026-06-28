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
    description: 'Games, dice rolls, and entertainment.',
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
    description: 'Server info, user info, ping, and general tools.',
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
  {
    name: 'verify embed',
    description: 'Post a verification embed with a Start Verification button and CAPTCHA modal.',
    usage: '/verify embed [title] [description] [color]',
    category: 'utility',
    extra: 'Requires: Manage Server • Members click the button, complete a CAPTCHA, and are verified automatically',
  },
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
