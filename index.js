import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

import gTTS from 'gtts';

import { 
  joinVoiceChannel, 
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType
} from '@discordjs/voice';

import 'dotenv/config';
import {
  Client,
  GatewayIntentBits
} from 'discord.js';

import * as prism from 'prism-media';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';


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
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false, // 🔥 ВАЖНО
      selfMute: false
    });

    await interaction.editReply('Я зашёл в голосовой канал.');
  }
  if (interaction.commandName === 'say') {
  const text = interaction.options.getString('text');

  let answer;

try {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "user", content: text }
    ],
    model: "llama-3.3-70b-versatile"
  });

  answer = chatCompletion.choices[0]?.message?.content || "Не знаю что ответить 😅";

} catch (error) {
  console.log('Groq error:', error);
  return await interaction.editReply('Ошибка Groq 😢');
}

  const connection = getVoiceConnection(interaction.guild.id);
  if (!connection) {
    return await interaction.editReply('Я не в голосовом канале.');
  }

  const player = createAudioPlayer();

player.on('error', error => {
  console.log('Player error:', error);
});


const fileName = `voice-${Date.now()}.mp3`;

const gtts = new gTTS(answer, 'ru');

gtts.save(fileName, async (err) => {
  if (err) {
    console.log('gTTS error:', err);
    return await interaction.editReply('Ошибка озвучки.');
  }

  const resource = createAudioResource(fileName, {
    inlineVolume: true
  });

  resource.volume.setVolume(1.5);

  player.play(resource);
  connection.subscribe(player);

  await interaction.editReply('Говорю...');
  });
}
if (interaction.commandName === 'listen') {
  const connection = getVoiceConnection(interaction.guild.id);

  if (!connection) {
    return await interaction.editReply('Сначала используй /join.');
  }

  const userId = interaction.user.id;
  const receiver = connection.receiver;

  await interaction.editReply('Слушаю тебя. Скажи фразу 🎤');

  const opusStream = receiver.subscribe(userId, {
    end: {
      behavior: EndBehaviorType.AfterSilence,
      duration: 1500
    }
  });

const decoder = new prism.opus.Decoder({
  rate: 48000,
  channels: 2,
  frameSize: 960
});

  const fileName = `listen-${Date.now()}.pcm`;
  const out = createWriteStream(fileName);

  pipeline(opusStream, decoder, out, async (err) => {
    if (err) {
      console.log('Listen error:', err);
      return;
    }

    console.log('Voice saved:', fileName);
  });

  return;
}

if (interaction.commandName === 'stoplisten') {
  return await interaction.editReply('Я перестал слушать.');
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