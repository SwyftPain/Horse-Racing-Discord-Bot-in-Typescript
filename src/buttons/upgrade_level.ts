import { Client, Interaction } from "discord.js";
import { QuickDB } from "quick.db";
const db = new QuickDB();

export default async (client: Client, interaction: Interaction) => {
  // Return if not a button
  if (!interaction.isButton()) return;

  // Return if incorrect customId
  if (interaction.customId !== "upgrade_level") return;

  // Check if database is null and if true, return
  const check: any = await db.get(`${interaction.user.id}_horse`);
  const profile: any = await db.get(`${interaction.user.id}_profile`);

  if (check == "null" || profile == "null") {
    return;
  }

  // Store values and convert to numbers
  const lv: any = await db.get(`${interaction.user.id}_horse.level`);
  const sp: any = await db.get(`${interaction.user.id}_horse.speed`);
  const mn: any = await db.get(`${interaction.user.id}_profile.money`);
  const level: number = lv;
  const speed: number = sp;
  const money: number = mn;

  // Store leveling up price
  const uplvl = parseInt(((level * (20 + speed)) / 2).toFixed(0));

  // Check if leveling up price is higher than the balance
  if (uplvl > money) {
    interaction.reply({
      content: "You don't have enough money!",
      ephemeral: true,
    });
    return;
  }

  // Check if new balance would be less than 0
  const newMoney = money - uplvl;
  if (newMoney < 0) {
    interaction.reply({
      content: "You don't have enough money!",
      ephemeral: true,
    });
    return;
  }

  // Store new level value
  const newLvl = level + 1;

  // Check if horse can be leveled up further
  if (newLvl > 9) {
    interaction.reply({
      content: "You can't level up your horse any further!",
      ephemeral: true,
    });
    return;
  }

  // Set new level and new money
  await db.set(`${interaction.user.id}_horse.level`, newLvl);
  await db.set(`${interaction.user.id}_profile.money`, newMoney);

  // Reply
  interaction.reply({
    content: "Upgrading your level!",
    ephemeral: true,
  });
  return;
};
