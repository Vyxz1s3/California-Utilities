export default {
  name: 'messageUpdate',
  async execute(client, oldMessage, newMessage) {
    if (!oldMessage.author || oldMessage.author.bot) return;
    if (!oldMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;

    // Cache the edited message for /snipe-edit
    client.editSnipeCache.set(oldMessage.channel.id, {
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      author: {
        id: oldMessage.author.id,
        tag: oldMessage.author.tag,
        displayAvatarURL: () => oldMessage.author.displayAvatarURL(),
      },
      editedAt: new Date(),
    });
  },
};
