import { Client, Interaction, EmbedBuilder } from "discord.js";
import { QuickDB } from "quick.db";
const db = new QuickDB();

export default async (client: Client, interaction: Interaction) => {
  // Return if not a button
  if (!interaction.isButton()) return;

  // Return if incorrect customId
  if (interaction.customId !== "get_new_horse") return;
  const random = function (min: number, max: number) {
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    return res;
  };
  const horses = ["Mini", "Juan", "Mickey"];
  const randomH = function (min: number, max: number) {
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    return horses[res];
  };
  const lvl = random(1, 3);
  const spd = random(1, 10);
  const randomHorse = await randomH(0, horses.length - 1);
  await db.set(`${interaction.user.id}_horse`, {
    name: randomHorse,
    level: lvl,
    speed: spd,
  });
  await db.set(`${interaction.user.id}_horse.name`, randomHorse);
  await db.set(`${interaction.user.id}_horse.level`, lvl);
  await db.set(`${interaction.user.id}_horse.speed`, spd);
  const embed = new EmbedBuilder();
  embed.setTitle("New horse");
  embed.setDescription(`**Name:** ${randomHorse}
**Level:** ${lvl}
**Speed:** ${spd}
  `);
  embed.setColor("Yellow");
  interaction.reply({ embeds: [embed], ephemeral: true });
};
