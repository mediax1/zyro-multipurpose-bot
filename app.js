require("dotenv").config();
const fs = require("fs");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load commands from the /commands directory
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  // User ID-based command restrictions
  if (command.role) {
    const userHasAccess = config.users[command.role].includes(
      message.author.id
    );

    if (!userHasAccess) {
      // Send the permission error message
      return message
        .reply(
          `You do not have permission to use the \`${commandName}\` command.`
        )
        .then((msg) => {
          // Set a 5-second timeout to delete the message
          setTimeout(() => {
            msg
              .delete()
              .catch((err) => console.error("Failed to delete message:", err));
          }, 5000); // 5000 milliseconds = 5 seconds
        })
        .catch((err) => console.error("Failed to send message:", err));
    }
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command!");
  }
});

client.login(process.env.DISCORD_TOKEN);
