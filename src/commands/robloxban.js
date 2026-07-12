const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config');
const { verifyRobloxUsername } = require('../utils/roblox');

const PERM_KEYWORDS = ['perm', 'permanentny', 'permanentnie', 'staly', 'stały'];

function parseBanDuration(raw) {
  const normalized = raw.trim().toLowerCase();
  if (PERM_KEYWORDS.includes(normalized)) {
    return { permanent: true, days: null };
  }

  const days = Number(normalized);
  if (!Number.isInteger(days) || days <= 0) {
    return null;
  }

  return { permanent: false, days };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('robloxban')
    .setDescription('Wystawia ban na nick Roblox i publikuje go na kanale logów banów')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((o) => o.setName('nick').setDescription('Nick Roblox banowanego gracza').setRequired(true))
    .addStringOption((o) =>
      o.setName('czas').setDescription('Liczba dni (np. 7) albo "perm" dla bana permanentnego').setRequired(true)
    )
    .addStringOption((o) => o.setName('powod').setDescription('Powód bana').setRequired(true)),

  async execute(interaction) {
    // /robloxban dziala wylacznie na tym, skonfigurowanym serwerze.
    if (interaction.guildId !== config.legacyGuildId) {
      await interaction.reply({ content: '❌ Ta komenda jest dostępna tylko na tym serwerze.', ephemeral: true });
      return;
    }

    const nick = interaction.options.getString('nick').trim();
    const rawCzas = interaction.options.getString('czas');
    const powod = interaction.options.getString('powod').trim();

    const duration = parseBanDuration(rawCzas);
    if (!duration) {
      await interaction.reply({
        content: '⚠️ Podaj poprawny czas — liczbę dni (np. `7`) albo `perm` dla bana permanentnego.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let robloxData = null;
    try {
      robloxData = await verifyRobloxUsername(nick);
    } catch (error) {
      console.error('Błąd podczas weryfikacji nicku Roblox w /robloxban:', error);
    }

    const now = Math.floor(Date.now() / 1000);
    const durationText = duration.permanent
      ? '♾️ Permanentny'
      : `${duration.days} dni (do <t:${now + duration.days * 24 * 60 * 60}:D>)`;

    const embed = new EmbedBuilder()
      .setColor('#e02b2b')
      .setTitle('🚫 Ban na Robloxie')
      .addFields(
        {
          name: '🎲 Nick Roblox',
          value: robloxData
            ? `[@${robloxData.name}](https://www.roblox.com/users/${robloxData.id}/profile)`
            : `${nick} ⚠️ *(nie znaleziono takiego konta)*`,
          inline: false,
        },
        { name: '⏱️ Czas trwania', value: durationText, inline: true },
        { name: '👮 Wystawił', value: `${interaction.user}`, inline: true },
        { name: '📝 Powód', value: powod, inline: false }
      )
      .setFooter({ text: config.serverName })
      .setTimestamp();

    if (robloxData && robloxData.avatarUrl) {
      embed.setThumbnail(robloxData.avatarUrl);
    }

    try {
      const channel = await interaction.client.channels.fetch(config.robloxBanChannelId);
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd podczas wysyłania bana na kanał docelowy:', error);
      await interaction.editReply({
        content: '❌ Nie udało się wysłać bana na kanał docelowy. Sprawdź uprawnienia bota i ID kanału.',
      });
      return;
    }

    await interaction.editReply({ content: `✅ Ban wysłany na kanał <#${config.robloxBanChannelId}>.` });
  },
};
