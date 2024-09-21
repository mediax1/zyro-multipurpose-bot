const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Replies with the bot\'s latency and API latency',
  role: null, // No restriction, anyone can use this command
  async execute(message, args) {
    // Send an initial message to calculate the bot latency
    const initialMessage = await message.reply('Calculating ping...');

    // Calculate bot latency
    const botLatency = Date.now() - message.createdTimestamp;

    // Get API latency
    const apiLatency = message.client.ws.ping;

    // Create an embed message
    const pingEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `\`${botLatency}ms\``, inline: true },
        { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.avatarURL() })
      .setTimestamp();

    // Edit the initial message with the embed
    await initialMessage.edit({ embeds: [pingEmbed] });

    // Delete the user's original message after sending the response
    await message.delete().catch(err => console.error('Failed to delete user message:', err));

    // Delete the embed message after 10 seconds
    setTimeout(() => {
      initialMessage.delete().catch(err => console.error('Failed to delete embed message:', err));
    }, 10000); // 10000 milliseconds = 10 seconds
  },
};