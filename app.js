require("dotenv").config();
const fs = require("fs");
const { checkReminders } = require("./utils/checkReminder");
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

const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const command = require(`./commands/${folder}/${file}`);
      if (command.name && typeof command.execute === "function") {
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
      } else {
        console.warn(`Skipping invalid command file: ${folder}/${file}`);
      }
    } catch (error) {
      console.error(
        `Failed to load command: ${file} from folder: ${folder}`,
        error
      );
    }
  }
}

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
  checkReminders(client);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) {
    return message
      .reply(`Unknown command: \`${commandName}\``)
      .then((msg) => {
        setTimeout(() => msg.delete().catch(console.error), 5000);
      })
      .catch(console.error);
  }

  if (command.role) {
    const userHasAccess = config.users[command.role]?.includes(
      message.author.id
    );

    if (!userHasAccess) {
      return message
        .reply(
          `You do not have permission to use the \`${commandName}\` command.`
        )
        .then((msg) => {
          setTimeout(() => msg.delete().catch(console.error), 5000);
        })
        .catch(console.error);
    }
  }
  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(`Error executing command: ${commandName}`, error);
    message
      .reply("There was an error executing that command!")
      .catch(console.error);
  }
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

client
  .login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log("Logged in successfully");
  })
  .catch((error) => {
    console.error("Failed to log in:", error);
  });
