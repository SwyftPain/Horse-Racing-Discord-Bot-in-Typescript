import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ChannelType,
  EmbedBuilder,
  Interaction,
  ActivitiesOptions,
  ActivityFlags,
  ActivityType,
  Presence,
  Events,
} from "discord.js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config();

// Import command type declarations
import { Command } from "./types";
import handleUpgradeLevel from "./buttons/upgrade_level";
import handleUpgradeSpeed from "./buttons/upgrade_speed";
import handleUpgradeHorse from "./buttons/get_new_horse";
import handleStartRace from "./buttons/start_race";

// Define embed, commands and cooldowns
const embed = new EmbedBuilder();
const commands = new Collection<string, Command>();
const cooldowns = new Collection<string, Collection<string, number>>();

const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".ts"));
for (const file of commandFiles) {
  const { command } = require(`./commands/${file}`);
  commands.set(command.name, command);
}

// Set intents and partials
const client = new Client({
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.DirectMessages,
  partials: [Partials.Message, Partials.Channel],
});

// Do something when the bot turns on
client.on("ready", () => {
  console.log("Ready!");
  client.user!.setPresence({
    activities: [{ name: `!help`, type: ActivityType.Listening }],
    status: "online",
  });
});

// Do something on a message sent
client.on("messageCreate", (message) => {
  // Store prefix
  const prefix = "yo ";

  // If the command does not start with the prefix, return
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);

  // Store command name and aliases
  const commandName = args.shift()!.toLowerCase();
  const command =
    commands.get(commandName) ||
    commands.find((c) => c.aliases && c.aliases.includes(commandName));

  // If command is not found in the collection, return
  if (!command) return;

  // If the command is set to botOwnerOnly, it checks for the OWNER_ID in .env and returns if it is not matching
  if (command.botOwnerOnly && message.author.id !== process.env.OWNER_ID)
    return;

  // Returns if the command is set to serverOnly and is being used in a DM
  if (command.serverOnly && message.channel.type !== ChannelType.GuildText) {
    embed.setDescription("This command cannot be used in DM's.");
    embed.setColor("Red");
    message.channel.send({ embeds: [embed] });
    return;
  }

  // Returns if command is set to not enabled
  if (command.enabled === false) return;

  // Checks if cooldown is set and returns the time remaining if it is
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }
  const now = Date.now();
  const timestamps = cooldowns.get(command.name)!;
  const cooldownAmount = (command.cooldown || 0) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      embed.setDescription(
        `Please wait \`${timeLeft.toFixed(
          1
        )}\` more second(s) before reusing the \`${command.name}\` command.`
      );
      embed.setColor("Red");
      message.channel.send({ embeds: [embed] });
      return;
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  // Checks if the command meets minimum arguments allowed
  if (command.minArgs && args.length < command.minArgs) {
    embed.setDescription(
      `This command requires at least ${command.minArgs} argument(s).`
    );
    embed.setColor("Red");
    message.channel.send({ embeds: [embed] });
    return;
  }

  // Checks if the command meets maximum arguments allowed
  if (args.length > command.maxArgs!) {
    embed.setDescription(
      `This command accepts at most ${command.maxArgs} argument(s).`
    );
    embed.setColor("Red");
    message.channel.send({ embeds: [embed] });
    return;
  }

  // Executes the command if everything is working properly and shows the error message if there is an error.
  try {
    command.execute(client, message, args);
  } catch (error) {
    console.error(error);
    embed.setDescription("There was an error trying to execute that command!");
    embed.setColor("Red");
    message.channel.send({ embeds: [embed] });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  switch (interaction.customId) {
    case "upgrade_level":
      await handleUpgradeLevel(client, interaction);
      break;
    case "upgrade_speed":
      await handleUpgradeSpeed(client, interaction);
      break;
    case "get_new_horse":
      await handleUpgradeHorse(client, interaction);
      break;
    case "start_race":
      await handleStartRace(client, interaction);
      break;
    // add other cases for each button here
  }
});

// Logins to the bot using BOT_TOKEN from .env
client.login(process.env.BOT_TOKEN);
