const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json'); // Import config.json

module.exports = {
  name: 'ban',
  description: 'Bans a user with an optional reason',
  role: 'admin', // Ensures only members with ban permissions can use this command
  async execute(message, args) {
    // Delete the user's original message after 5 seconds
    setTimeout(() => {
      message.delete().catch(err => console.error('Failed to delete user message:', err));
    }, 5000); // 5000 milliseconds = 5 seconds

    // Check if the message author has permission to ban
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('You don\'t have permission to use this command!').then(msg => {
        setTimeout(() => msg.delete().catch(err => console.error('Failed to delete response message:', err)), 10000);
      });
    }

    // Parse user and reason from arguments
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!user) {
      return message.reply('You need to mention a user to ban!').then(msg => {
        setTimeout(() => msg.delete().catch(err => console.error('Failed to delete response message:', err)), 10000);
      });
    }

    // Get the member from the mentioned user
    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply('User not found in this guild!').then(msg => {
        setTimeout(() => msg.delete().catch(err => console.error('Failed to delete response message:', err)), 10000);
      });
    }

    // Check if the member can be banned
    if (!member.bannable) {
      return message.reply('I cannot ban this user! They might have higher permissions than me.').then(msg => {
        setTimeout(() => msg.delete().catch(err => console.error('Failed to delete response message:', err)), 10000);
      });
    }

    // Try to send a DM to the user
    try {
      await user.send(`You have been banned from ${message.guild.name} by ${message.author.tag} for the following reason: ${reason}`);
    } catch (err) {
      console.error('Failed to send DM to the user:', err);
      message.channel.send(`${user.tag} has been banned but could not be DMed.`);
    }

    // Try to ban the member
    try {
      await member.ban({ reason });

      // Send a confirmation message with a GIF
      await message.channel.send({
        content: `${user.tag} has been banned! Reason: ${reason}`,
        files: ['https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzR3em56cHNrZDIzZWlxeTNkY3B4bHJ0d3cxajV6NW5iZ2RsYzNudCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fe4dDMD2cAU5RfEaCU/giphy.gif'] // Example GIF URL
      });

      // Log to mod logs if logging is enabled in config
      if (config.logging) {
        const modLogsChannel = message.guild.channels.cache.get(config.modLogsChannelId);
        if (modLogsChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('User Banned')
            .addFields(
              { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Banned By', value: `${message.author.tag}`, inline: true },
              { name: 'Reason', value: reason, inline: true }
            )
            .setTimestamp();

          await modLogsChannel.send({ embeds: [logEmbed] });
        } else {
          console.error('Mod logs channel not found!');
        }
      }

    } catch (err) {
      console.error('Failed to ban the user:', err);
      return message.reply('An error occurred while trying to ban the user.').then(msg => {
        setTimeout(() => msg.delete().catch(err => console.error('Failed to delete error message:', err)), 10000);
      });
    }
  },
};