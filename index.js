import gTTS from 'gtts';
import fs from 'fs';

import { 
  joinVoiceChannel, 
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource
} from '@discordjs/voice';

import 'dotenv/config';
import {
  Client,
  GatewayIntentBits
} from 'discord.js';


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply();

  if (interaction.commandName === 'join') {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      await interaction.editReply('Сначала зайди в голосовой канал.');
      return;
    }

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    await interaction.editReply('Я зашёл в голосовой канал.');
  }
  if (interaction.commandName === 'say') {
  const text = interaction.options.getString('text');

  const connection = getVoiceConnection(interaction.guild.id);
  if (!connection) {
    return await interaction.editReply('Я не в голосовом канале.');
  }

  const player = createAudioPlayer();
const fileName = `voice-${Date.now()}.mp3`;

const gtts = new gTTS(text, 'ru');

return gtts.save(fileName, (err) => {
  if (err) {
    console.log('gTTS error:', err);
    interaction.editReply('Ошибка озвучки.');
    return;
  }

  const resource = createAudioResource(fileName);

  player.play(resource);
  connection.subscribe(player);

  interaction.editReply('Говорю...');
});
  }
  if (interaction.commandName === 'leave') {
    const connection = getVoiceConnection(interaction.guild.id);

    if (connection) {
      connection.destroy();
      await interaction.editReply('Я вышел из голосового канала.');
    } else {
      await interaction.editReply('Я сейчас не в голосовом канале.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);