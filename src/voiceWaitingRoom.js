const { EmbedBuilder } = require('discord.js');
const config = require('./config');

// Wysyla powiadomienie z pingiem roli, gdy ktos wejdzie na kanal glosowy
// pelniacy funkcje "poczekalni". Ignorujemy przypadki, gdy ktos juz byl
// na tym kanale (np. zmiana ustawien mikrofonu) - liczy sie tylko
// faktyczne wejscie z innego kanalu (albo spoza kanalow glosowych).
async function handleVoiceStateUpdate(oldState, newState) {
  if (newState.channelId !== config.waitingRoomVoiceChannelId) return;
  if (oldState.channelId === config.waitingRoomVoiceChannelId) return;

  try {
    const channel = await newState.guild.channels.fetch(config.waitingRoomNotifyChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setDescription(`🔔 ${newState.member} dołączył na kanał poczekalni **${newState.channel.name}**.`)
      .setTimestamp();

    await channel.send({
      content: `<@&${config.waitingRoomPingRoleId}>`,
      embeds: [embed],
    });
  } catch (error) {
    console.error('Błąd podczas wysyłania powiadomienia o poczekalni:', error);
  }
}

module.exports = { handleVoiceStateUpdate };
