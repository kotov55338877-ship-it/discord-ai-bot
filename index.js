import fetch from 'node-fetch';
import fs from 'fs';

import { 
  joinVoiceChannel, 
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource
} from '@discordjs/voice';

import { spawn } from 'child_process';

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

  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.8
        }
      })
    }
  );

  if (!response.ok) {
  const errorText = await response.text();
  console.log('ElevenLabs error:', response.status, errorText);
  return await interaction.editReply('Ошибка ElevenLabs. Смотри терминал.');
}

  const fileName = `voice-${Date.now()}.mp3`;
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(fileName, buffer);

  const resource = createAudioResource(fileName);
  player.play(resource);
  connection.subscribe(player);

  await interaction.editReply('Говорю...');
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