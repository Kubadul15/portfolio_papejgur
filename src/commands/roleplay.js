const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const registry = require('../utils/registry');

const ROLEPLAY_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1513551625158004787/1525045137137471518/standard_7.gif?ex=6a51f476&is=6a50a2f6&hm=04403f6619ca24f00343bf9c4ccefbf6851ea8d49855f8cf37419e1f5d2da589&';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleplay')
    .setDescription('Rozpoczyna lub kończy sesję RP na serwerze')
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription('Rozpoczyna nową sesję RP')
        .addStringOption((o) =>
          o.setName('kod').setDescription('Własny kod sesji (opcjonalnie)').setRequired(false)
        )
    )
    .addSubcommand((sub) => sub.setName('stop').setDescription('Kończy aktualną sesję RP')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'start') {
      const customCode = interaction.options.getString('kod');
      const result = registry.startRoleplaySession(interaction.user.id, interaction.user.tag, customCode);
      if (result.alreadyActive) {
        await interaction.reply({
          content: `❌ Sesja RP już trwa — kod \`${result.session.code}\`, rozpoczęta przez <@${result.session.startedBy}>.`,
          ephemeral: true,
        });
        return;
      }
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('🎬 Sesja RP rozpoczęta')
        .addFields(
          { name: '🔑 Kod sesji', value: `\`${result.session.code}\``, inline: true },
          { name: '👤 Rozpoczął', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setImage(ROLEPLAY_IMAGE_URL)
        .setFooter({ text: config.serverName })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
      return;
    }
    if (subcommand === 'stop') {
      const result = registry.stopRoleplaySession(interaction.user.id, interaction.user.tag);
      if (result.notActive) {
        await interaction.reply({ content: '❌ Nie ma obecnie aktywnej sesji RP.', ephemeral: true });
        return;
      }
      const minutes = Math.round(result.durationMs / 60000);
      const embed = new EmbedBuilder()
        .setColor('#e02b2b')
        .setTitle('🛑 Sesja RP zakończona')
        .addFields(
          { name: '🔑 Kod sesji', value: `\`${result.session.code}\``, inline: true },
          { name: '🎬 Rozpoczął', value: `<@${result.session.startedBy}>`, inline: true },
          { name: '🏁 Zakończył', value: `<@${interaction.user.id}>`, inline: true },
          { name: '⏱️ Czas trwania', value: `${minutes} min`, inline: true }
        )
        .setFooter({ text: config.serverName })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
};
