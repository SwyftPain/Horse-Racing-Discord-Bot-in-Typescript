import { Command } from "../types";
import { setTimeout as wait } from 'node:timers/promises';
import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ActionRowComponent,
  ActionRowComponentOptions,
  ButtonStyle,
  ComponentType,
  Events,
  Guild,
  ChannelType,
} from "discord.js";
import { QuickDB } from "quick.db";
const db = new QuickDB();

export const command: Command = {
  name: "horse",
  description: "Get or check your own horse",
  minArgs: 0,
  maxArgs: 0,
  cooldown: 0,
  botOwnerOnly: false,
  serverOnly: true,
  enabled: true,
  aliases: ["h"],
  async execute(client, message, args) {
    // Create a function for a random number
    const random = function (min: number, max: number) {
      const res = Math.floor(Math.random() * (max - min + 1)) + min;
      return res;
    };

    // Get databases
    const check: any = await db.get(`${message.author.id}_horse`);
    const profile: any = await db.get(`${message.author.id}_profile`);

    // If profile database is empty, create a new one
    if (profile == null) {
      await db.set(`${message.author.id}_profile`, { money: 1 });
    }

    // If horse database is empty, create a new one
    if (check == null) {
      // Get random horse names
      const horses = ["Mini", "Juan", "Mickey"];

      // Create a function to get random name from horse names array
      const randomH = function (min: number, max: number) {
        const res = Math.floor(Math.random() * (max - min + 1)) + min;
        return horses[res];
      };

      // Generate random level, speed, money and horse name
      const lvl = random(1, 3);
      const spd = random(1, 10);
      const mn = random(1, 50);
      const randomHorse = await randomH(0, horses.length - 1);

      // Add horse related values to horse database
      await db.set(`${message.author.id}_horse`, {
        name: randomHorse,
        level: lvl,
        speed: spd,
        money: mn,
      });

      // Add money to profile database
      await db.set(`${message.author.id}_profile`, { money: mn });

      // Create a message
      const embed = new EmbedBuilder();
      embed.setTitle("New horse");
      embed.setDescription(`**Name:** ${randomHorse}
**Level:** ${lvl}
**Speed:** ${spd}
    `);
      embed.setColor("Yellow");
      message.channel.send({ embeds: [embed] });
    } else {
      // If user has profile and a horse, take the values
      const { name, level, speed } = check;
      const { money } = profile;

      // Calculate speed and level upgrading vost
      const upspeed = ((speed * (10 + level)) / 2).toFixed(0);
      const uplvl = ((level * (20 + speed)) / 2).toFixed(0);

      // Create embed message
      const embed = new EmbedBuilder();
      embed.setTitle(":horse_racing::skin-tone-1: " + name);
      embed.setAuthor({ name: message.author.username + " - horse" });
      embed.setThumbnail(message.author.displayAvatarURL());
      embed.addFields(
        {
          name: ":information_source: Info:",
          value: `:credit_card: **Money:** $${money}`,
          inline: false,
        },
        {
          name: "📊 Horse Stats:",
          value: `💥 **Level:** ${level}
🏃 **Speed:** ${speed}
`,
          inline: false,
        },
        {
          name: `💵 Upgrade costs:`,
          value: `
💥 **Level:** $${uplvl}
🏃 **Speed:** $${upspeed}
`,
          inline: true,
        }
      );
      embed.setColor("Yellow");

      // Create buttons
      const row: any = new ActionRowBuilder();
      const row2: any = new ActionRowBuilder();
      const button1 = new ButtonBuilder();
      button1.setLabel("Upgrade Speed");
      button1.setCustomId("upgrade_speed");
      button1.setEmoji("🏃");
      button1.setStyle(ButtonStyle.Success);
      // If speed is 10, disable upgrading
      if (speed > 9) {
        button1.setDisabled(true);
      }
      const button2 = new ButtonBuilder();
      button2.setLabel("Upgrade Level");
      button2.setCustomId("upgrade_level");
      button2.setStyle(ButtonStyle.Success);
      button2.setEmoji("💥");
      // If level is 10, disable upgrading
      if (level > 9) {
        button2.setDisabled(true);
      }
      const button3 = new ButtonBuilder();
      button3.setLabel("Get New Horse");
      button3.setCustomId("get_new_horse");
      button3.setStyle(ButtonStyle.Danger);
      button3.setEmoji("🐴");
      const button4 = new ButtonBuilder();
      button4.setLabel("Start Race");
      button4.setCustomId("start_race");
      button4.setStyle(ButtonStyle.Primary);
      button4.setEmoji("🏁");

      // Add buttons to action row and to the embed
      row.addComponents(button4, button3);
      row2.addComponents(button1, button2);
      message.channel.send({ embeds: [embed], components: [row2, row] });
    }
  },
};
