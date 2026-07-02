const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { buildPanelEmbed, buildVerificationPanelEmbed } = require('../utils/embeds');
const { CREATE_ID_BUTTON_ID, VERIFY_START_PREFIX } = require('../interactions/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Publikowanie paneli weryfikacyjnych serwera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName('stworz-dowod').setDescription('Wysyła panel do tworzenia Dowodu Osobistego RP')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('weryfikacja')
        .setDescription('Wysyła panel weryfikacji konta Roblox, który po sukcesie nadaje rolę')
        .addChannelOption((option) =>
          option
            .setName('kanal')
            .setDescription('Kanał, na który zostanie wysłany panel weryfikacji')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option.setName('ranga').setDescription('Rola nadawana po pozytywnej weryfikacji').setRequired(true)
        )
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
      return;
    }

    if (subcommand === 'weryfikacja') {
      const channel = interaction.options.getChannel('kanal');
      const role = interaction.options.getRole('ranga');

      const embed = buildVerificationPanelEmbed(role);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${VERIFY_START_PREFIX}:${role.id}`)
          .setLabel('Zweryfikuj się')
          .setEmoji('🔐')
          .setStyle(ButtonStyle.Primary)
      );

      try {
        await channel.send({ embeds: [embed], components: [row] });
      } catch (error) {
        console.error('Błąd podczas wysyłania panelu weryfikacji:', error);
        await interaction.reply({
          content: `❌ Nie udało się wysłać panelu na ${channel}. Sprawdź, czy bot ma tam uprawnienia do wysyłania wiadomości.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({ content: `✅ Panel weryfikacji wysłany na ${channel}.`, ephemeral: true });
    }
  },
};
