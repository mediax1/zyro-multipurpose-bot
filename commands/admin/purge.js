module.exports = {
  name: "purge",
  description: "Deletes all messages in the channel.",
  role: "admin",
  async execute(message, args) {
    const confirmationMessage = await message.channel.send(
      "⚠️ Are you sure you want to delete **ALL** messages in this channel? Reply with `yes` to confirm. This action cannot be undone."
    );

    const filter = (response) => {
      return (
        response.author.id === message.author.id &&
        response.content.toLowerCase() === "yes"
      );
    };

    try {
      const collected = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 10000,
        errors: ["time"],
      });

      if (collected.first().content.toLowerCase() === "yes") {
        await confirmationMessage.delete();
        await collected.first().delete();

        let deletedCount = 0;

        let messagesToDelete;
        do {
          messagesToDelete = await message.channel.messages.fetch({
            limit: 100,
          });
          if (messagesToDelete.size > 0) {
            await message.channel.bulkDelete(messagesToDelete);
            deletedCount += messagesToDelete.size;
          }
        } while (messagesToDelete.size >= 2);

        message.channel
          .send(`✅ Purged ${deletedCount} messages from this channel.`)
          .then((msg) => {
            setTimeout(() => msg.delete(), 5000);
          });
      }
    } catch (err) {
      message.channel.send("❌ Purge canceled (no confirmation received).");
    }
  },
};
