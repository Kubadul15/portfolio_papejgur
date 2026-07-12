const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');
const { sendAdminLog } = require('../utils/adminLog');
const { ADMIN_CHANNEL_DELETE_CONFIRM_PREFIX, CANCEL_ID_BUTTON_ID } = require('../interactions/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Narzędzia administracyjne')
    .addSubcommand((sub) => sub.setName('przywroc-range').setDescription('Przywraca Twoją zapasową rolę na wyznaczonym serwerze'))
    .addSubcommand((sub) =>
      sub
        .setName('usun-kanal')
        .setDescription('Usuwa wskazany kanał (wymaga potwierdzenia)')
        .addChannelOption((option) => option.setName('kanal').setDescription('Kanał do usunięcia').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'przywroc-range') {
      // Twarda blokada: ta podkomenda dziala WYLACZNIE dla jednego,
      // skonfigurowanego uzytkownika na jednym, skonfigurowanym serwerze -
      // nikt inny, nawet z uprawnieniami administratora, nie moze jej uzyc.
      if (interaction.guildId !== config.restoreRoleGuildId || interaction.user.id !== config.restoreRoleUserId) {
        await interaction.reply({ content: '❌ Nie masz dostępu do tej komendy.', ephemeral: true });
        return;
      }

      try {
        const role = await interaction.guild.roles.fetch(config.restoreRoleId);
        if (!role) throw new Error('Skonfigurowana rola już nie istnieje na tym serwerze.');
        await interaction.member.roles.add(role);
      } catch (error) {
        console.error('Błąd podczas przywracania roli:', error);
        await interaction.reply({
          content: '❌ Nie udało się nadać roli — sprawdź, czy bot ma uprawnienie Zarządzaj rolami i czy jego rola jest wyżej niż przywracana.',
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({ content: `✅ Rola <@&${config.restoreRoleId}> została przywrócona.`, ephemeral: true });

      await sendAdminLog(interaction.client, {
        title: '🔑 Przywrócono zapasową rolę',
        description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n**Rola:** <@&${config.restoreRoleId}>`,
      });
      return;
    }

    if (subcommand === 'usun-kanal') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({
          content: '❌ Ta komenda wymaga uprawnienia Zarządzaj kanałami.',
          ephemeral: true,
        });
        return;
      }

      const channel = interaction.options.getChannel('kanal');

      const embed = new EmbedBuilder()
        .setColor('#e02b2b')
        .setTitle('⚠️ Potwierdź usunięcie kanału')
        .setDescription(`Czy na pewno chcesz usunąć kanał ${channel} (\`${channel.name}\`)? Tej operacji nie da się cofnąć.`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${ADMIN_CHANNEL_DELETE_CONFIRM_PREFIX}:${channel.id}`)
          .setLabel('Usuń kanał')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(CANCEL_ID_BUTTON_ID).setLabel('Anuluj').setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
  },
};
