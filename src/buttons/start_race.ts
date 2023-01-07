import { Client, Interaction, EmbedBuilder, Collection } from "discord.js";
import { QuickDB } from "quick.db";
const db = new QuickDB();
const cooldowns = new Collection<string, Collection<string, number>>();

export default async (client: Client, interaction: Interaction) => {
  // Return if not a button
  if (!interaction.isButton()) return;

  // Return if incorrect customId
  if (interaction.customId !== "start_race") return;

  // Define cooldown
  if (!cooldowns.has("start_race")) {
    cooldowns.set("start_race", new Collection());
  }
  const cooldown: number = 60 * 60;
  const timestamps = cooldowns.get("start_race")!;
  const now = Date.now();
  const cooldownAmount = (cooldown || 0) * 1000;

  // Return if the start_race command is still on cooldown for the user
  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      const cdembed = new EmbedBuilder();
      cdembed.setTitle("Cooldown");
      const seconds = parseInt(timeLeft.toFixed(1));
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      cdembed.setDescription(`Please wait ${minutes} minute(s) and ${remainingSeconds} second(s) before starting another race again.`);
      cdembed.setColor("Red");
      interaction.reply({
        embeds: [cdembed],
        ephemeral: true,
      });
      return;
    }
  }

  // Set the timestamp for the start_race command for the user
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  // Set random function
  const random = function (min: number, max: number) {
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    return res;
  };

  // Get users horse
  const horse: any = await db.get(`${interaction.user.id}_horse`);
  const check: any = await db.get(`${interaction.user.id}_profile`);
  const { name, level, speed } = horse;
  const { money } = check;

  // Send a reply
  const tod = await interaction.reply({
    content: "Race started!",
    ephemeral: true,
  });

  // Delete reply after 5 seconds
  setTimeout(() => {
    interaction.deleteReply();
  }, 5000);

  // Create race embed
  const embed = new EmbedBuilder();
  embed.setAuthor({ name: interaction.user.username + " - race" });
  embed.setColor("Yellow");
  embed.setTitle("Race started");

  // Check horse level and speed
  const toCheck = level * speed;

  // Create random number up to a 100
  const toCheckWith = random(0, 101);

  // Create a chance to win based on level and a speed
  const willWin = toCheck > toCheckWith ? true : false;

  // Create random places
  const places = [
    "second",
    "last",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
  ];

  // Create random accidents
  const accidents = [
    "fell and broke a leg",
    "hit the wall",
    "fell of the horse and it ran away",
    "got caught in fire",
    "fell asleep",
  ];

  // Create random surprises
  const surprises = [
    "took over the lead",
    "jumped over all other racers",
    "fell right in front of the finish line",
    "somehow got a nitro boost and sprinted in the front",
    "raced backwards and is almost at the finish line",
  ];

  // Create a function that takes a random value from an array
  const randomH = function (min: number, max: number, array: string[]) {
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    return array[res];
  };

  // Get random arrays
  const randomPlace = await randomH(0, places.length - 1, places);
  const randomAccident = await randomH(0, accidents.length - 1, accidents);
  const randomSurprise = await randomH(0, surprises.length - 1, surprises);

  // Get the new money values
  const wonMoneys: number = random(15, 31);
  const lostMoneys: number = random(1, 16);
  const wonMoney: number = money + wonMoneys;
  const lostMoney: number = money + lostMoneys;

  // Check if user will win
  if (willWin) {
    // Set messages with delay
    embed.setDescription(
      `**${name}** is currently in the **${randomPlace}** place.`
    );
    const test = await interaction.channel?.send({ embeds: [embed] });
    setTimeout(() => {
      embed.setTitle("Racing");
      embed.setDescription(
        `Wait, what just happened? It looks like **${interaction.user.username} ${randomAccident}**.`
      );
      test?.edit({ embeds: [embed] });
    }, 5000);
    setTimeout(() => {
      embed.setDescription(`Will they be able to continue the race?`);
      test?.edit({ embeds: [embed] });
    }, 15000);
    setTimeout(() => {
      embed.setDescription(`There is not much time left.
  
Looks like **${interaction.user.username}** is out of it and back in the race.`);
      test?.edit({ embeds: [embed] });
    }, 25000);
    setTimeout(() => {
      embed.setDescription(`And what is that? **${name} ${randomSurprise}**.
  
Unbelievable.`);
      test?.edit({ embeds: [embed] });
    }, 35000);
    setTimeout(() => {
      embed.setTitle("Race over!");
      embed.setDescription(
        `**${name} and ${interaction.user.username}** just **won** the race.
        
They earned **$${wonMoneys}**!`
      );
      test?.edit({ embeds: [embed] });
    }, 45000);
    await db.set(`${interaction.user.id}_profile.money`, wonMoney);
  } else {
    // If user loses, set messages with delay
    embed.setDescription(
      `**${name}** is currently in the **${randomPlace}** place.`
    );
    const test = await interaction.channel?.send({ embeds: [embed] });
    setTimeout(() => {
      embed.setTitle("Racing");
      embed.setDescription(
        `Wait, what just happened? It looks like **${interaction.user.username} ${randomAccident}**.`
      );
      test?.edit({ embeds: [embed] });
    }, 5000);
    setTimeout(() => {
      embed.setDescription(`Will they be able to continue the race?`);
      test?.edit({ embeds: [embed] });
    }, 15000);
    setTimeout(() => {
      embed.setDescription(`There is not much time left.
  
Looks like **${interaction.user.username}** is out of it and back in the race.`);
      test?.edit({ embeds: [embed] });
    }, 25000);
    setTimeout(() => {
      embed.setDescription(`And what is that? **${name} ${randomSurprise}**.
  
Unbelievable.`);
      test?.edit({ embeds: [embed] });
    }, 35000);
    setTimeout(() => {
      embed.setDescription(
        `**${name}** just **${randomAccident}** and is now refusing to keep racing!`
      );
      test?.edit({ embeds: [embed] });
    }, 45000);
    setTimeout(() => {
      embed.setTitle("Race over!");
      embed.setDescription(
        `**${name}** finished in the **${randomPlace}** place and **lost** the race.
        
They got **$${lostMoneys}** consolation price.`
      );
      test?.edit({ embeds: [embed] });
    }, 55000);
    await db.set(`${interaction.user.id}_profile.money`, lostMoney);
  }
};
