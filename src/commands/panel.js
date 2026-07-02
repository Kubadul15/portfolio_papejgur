const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { buildPanelEmbed } = require('../utils/embeds');
const { CREATE_ID_BUTTON_ID } = require('../interactions/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Publikowanie paneli weryfikacyjnych serwera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName('stworz-dowod').setDescription('Wysyła panel do tworzenia Dowodu Osobistego RP')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'stworz-dowod') {
      const embed = buildPanelEmbed();
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(CREATE_ID_BUTTON_ID)
          .setLabel('Stwórz Dowód')
          .setEmoji('🪪')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  },
};
