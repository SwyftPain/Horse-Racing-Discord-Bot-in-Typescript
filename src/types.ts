import { Client, Message, EmbedBuilder } from "discord.js";

export interface Command {
  name: string;
  description?: string;
  minArgs?: number;
  maxArgs?: number;
  cooldown?: number;
  botOwnerOnly?: boolean;
  serverOnly?: boolean;
  enabled?: boolean;
  aliases?: string[];
  execute(client: Client, message: Message, args?: string[]): void;
}