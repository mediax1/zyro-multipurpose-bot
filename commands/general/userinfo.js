const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Displays information about a user',
  role: null, // No restriction, anyone can use this command
  async execute(message, args) {
    // Check if a user was mentioned; if not, use the message author
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    // Create an embed message
    const userInfoEmbed = new EmbedBuilder()
      .setColor('#00A1FF')
      .setTitle('👤 User Information')
      .addFields(
        { name: 'Username', value: `${user.username}#${user.discriminator}` },
        { name: 'User ID', value: `${user.id}` },
        { name: 'Account Created On', value: `${user.createdAt.toDateString()}` },
        { name: 'Joined Server On', value: `${member.joinedAt.toDateString()}` },
        { name: 'Roles', value: member.roles.cache.size > 0 ? member.roles.cache.map(role => role.toString()).join('\n') : 'None' }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.avatarURL() })
      .setTimestamp();

    // Send the embed message
    const replyMessage = await message.reply({ embeds: [userInfoEmbed] });

    // Delete the user's original message after sending the response
    await message.delete().catch(err => console.error('Failed to delete user message:', err));

    // Delete the embed message after 10 seconds
    setTimeout(() => {
      replyMessage.delete().catch(err => console.error('Failed to delete embed message:', err));
    }, 10000); // 10000 milliseconds = 10 seconds
  },
};