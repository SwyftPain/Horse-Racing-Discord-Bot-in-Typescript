import { Client, Interaction } from "discord.js";
import { QuickDB } from "quick.db";
const db = new QuickDB();

export default async (client: Client, interaction: Interaction) => {
  // Return if not a button
  if (!interaction.isButton()) return;

  // Return if incorrect customId
  if (interaction.customId !== "upgrade_speed") return;

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

  // Store speeding up price
  const upspd = parseInt(((speed * (10 + level)) / 2).toFixed(0));

  // Check if speeding up price is higher than the balance
  if (upspd > money) {
    interaction.reply({
      content: "You don't have enough money!",
      ephemeral: true,
    });
    return;
  }

  // Check if new balance would be less than 0
  const newMoney = money - upspd;
  if (newMoney < 0) {
    interaction.reply({
      content: "You don't have enough money!",
      ephemeral: true,
    });
    return;
  }

  // Store new speed value
  const newSpd = sp + 1;

  // Check if horse can be sped up further
  if (upspd > 9) {
    interaction.reply({
      content: "You can't increase the speed of your horse any further!",
      ephemeral: true,
    });
    return;
  }

  // Set new speed and new money
  await db.set(`${interaction.user.id}_horse.speed`, newSpd);
  await db.set(`${interaction.user.id}_profile.money`, newMoney);

  // Reply
  interaction.reply({
    content: "Upgrading your horse speed!",
    ephemeral: true,
  });
  return;
};
