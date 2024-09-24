const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Replies with the bot's latency and API latency",
  role: null,
  async execute(message, args) {
    try {
      const initialMessage = await message.reply("Calculating ping...");

      const botLatency = Date.now() - message.createdTimestamp;
      const apiLatency = message.client.ws.ping;

      const pingEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("🏓 Pong!")
        .addFields(
          { name: "Bot Latency", value: `\`${botLatency}ms\``, inline: true },
          { name: "API Latency", value: `\`${apiLatency}ms\``, inline: true }
        )
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.avatarURL(),
        })
        .setTimestamp();

      await initialMessage
        .edit({ embeds: [pingEmbed] })
        .catch((err) =>
          console.error("Failed to edit initial message with embed:", err)
        );

      await message
        .delete()
        .catch((err) => console.error("Failed to delete user message:", err));

      setTimeout(() => {
        initialMessage
          .delete()
          .catch((err) =>
            console.error("Failed to delete embed message:", err)
          );
      }, 10000);
    } catch (error) {
      console.error("An error occurred in the ping command:", error);
    }
  },
};
