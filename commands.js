import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('join')
    .setDescription('Бот заходит в твой голосовой канал'),

  new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Бот выходит из голосового канала'),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Бот говорит текст в голосовом канале')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Что сказать')
        .setRequired(true)
    ),
    new SlashCommandBuilder()
  .setName('listen')
  .setDescription('Бот начинает слушать тебя'),

new SlashCommandBuilder()
  .setName('stoplisten')
  .setDescription('Бот перестаёт слушать'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

console.log('Slash commands registered');