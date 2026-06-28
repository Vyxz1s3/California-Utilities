export default {
  name: 'messageDelete',
  async execute(client, message) {
    if (!message.author || message.author.bot) return;
    if (!message.guild) return;

    // Cache the deleted message for /snipe
    client.snipeCache.set(message.channel.id, {
      content: message.content,
      author: {
        id: message.author.id,
        tag: message.author.tag,
        displayAvatarURL: () => message.author.displayAvatarURL(),
      },
      attachments: message.attachments.map(a => a.url),
      deletedAt: new Date(),
    });
  },
};
