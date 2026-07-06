const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const {
  buildPanelEmbed,
  buildVerificationPanelEmbed,
  buildExamPanelEmbed,
  buildVehiclePanelEmbed,
  buildTicketPanelEmbed,
  buildApplicationPanelEmbed,
  buildMafiaPanelEmbed,
} = require('../utils/embeds');
const {
  CREATE_ID_BUTTON_ID,
  EXAM_START_PREFIX,
  VEHICLE_START_PREFIX,
  TICKET_CREATE_PREFIX,
  APP_START_PREFIX,
  MAFIA_START_PREFIX,
} = require('../interactions/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Publikowanie paneli weryfikacyjnych serwera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stworz-dowod')
        .setDescription('Wysyła panel do tworzenia Dowodu Osobistego RP')
        .addRoleOption((option) =>
          option
            .setName('ranga')
            .setDescription('Opcjonalna rola nadawana automatycznie po wysłaniu dowodu')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('weryfikacja')
        .setDescription('Wysyła panel weryfikacji — tworzy Dowód Osobisty RP i nadaje rolę zweryfikowanego')
        .addRoleOption((option) =>
          option.setName('ranga').setDescription('Rola nadawana po pozytywnej weryfikacji').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('prawojazdy')
        .setDescription('Wysyła panel egzaminu na Prawo Jazdy RP')
        .addChannelOption((option) =>
          option
            .setName('kanal')
            .setDescription('Kanał, na który trafiają zdane prawa jazdy')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('ranga')
            .setDescription('Opcjonalna rola nadawana automatycznie po zdanym egzaminie')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('pojazd')
        .setDescription('Wysyła panel rejestracji pojazdu (wymaga posiadania prawa jazdy)')
        .addChannelOption((option) =>
          option
            .setName('kanal')
            .setDescription('Kanał, na który trafiają zarejestrowane pojazdy')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('wymagana-ranga')
            .setDescription('Rola wymagana do zarejestrowania pojazdu (np. nadawana po zdaniu prawa jazdy)')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('tickety')
        .setDescription('Wysyła panel tworzenia prywatnych ticketów wsparcia')
        .addChannelOption((option) =>
          option
            .setName('kanal')
            .setDescription('Kanał, na który zostanie wysłany panel ticketów')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName('kategoria')
            .setDescription('Kategoria, w której będą tworzone kanały ticketów')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('rola-obslugi')
            .setDescription('Rola widząca nowe tickety i mogąca je przyjmować/zamykać')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('rekrutacja')
        .setDescription('Wysyła panel podań o dołączenie do serwera')
        .addChannelOption((option) =>
          option
            .setName('kanal')
            .setDescription('Kanał, na który zostanie wysłany panel rekrutacji')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName('kategoria')
            .setDescription('Kategoria, w której będą tworzone kanały podań')
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('rola-obslugi')
            .setDescription('Rola widząca podania i mogąca je rozpatrywać')
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName('ranga-po-akceptacji')
            .setDescription('Opcjonalna rola nadawana automatycznie po przyjęciu podania')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('mafia')
        .setDescription('Wysyła panel tworzenia Mafii/Gangu')
        .addChannelOption((option) =>
          option
            .setName('kanal')
            .setDescription('Kanał, na który trafiają zarejestrowane organizacje')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'stworz-dowod') {
      const role = interaction.options.getRole('ranga');

      const embed = buildPanelEmbed(role);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(role ? `${CREATE_ID_BUTTON_ID}:${role.id}` : CREATE_ID_BUTTON_ID)
          .setLabel('Stwórz Dowód')
          .setEmoji('🪪')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (subcommand === 'weryfikacja') {
      const role = interaction.options.getRole('ranga');

      const embed = buildVerificationPanelEmbed(role);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${CREATE_ID_BUTTON_ID}:${role.id}`)
          .setLabel('Zweryfikuj się')
          .setEmoji('🔐')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (subcommand === 'prawojazdy') {
      const channel = interaction.options.getChannel('kanal');
      const role = interaction.options.getRole('ranga');

      const embed = buildExamPanelEmbed(channel, role);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${EXAM_START_PREFIX}:${channel.id}:${role ? role.id : ''}`)
          .setLabel('Podejdź do egzaminu')
          .setEmoji('🚗')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (subcommand === 'pojazd') {
      const channel = interaction.options.getChannel('kanal');
      const requiredRole = interaction.options.getRole('wymagana-ranga');

      const embed = buildVehiclePanelEmbed(channel, requiredRole);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${VEHICLE_START_PREFIX}:${channel.id}:${requiredRole.id}`)
          .setLabel('Zarejestruj pojazd')
          .setEmoji('🚙')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (subcommand === 'tickety') {
      const channel = interaction.options.getChannel('kanal');
      const category = interaction.options.getChannel('kategoria');
      const supportRole = interaction.options.getRole('rola-obslugi');

      const embed = buildTicketPanelEmbed(supportRole);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${TICKET_CREATE_PREFIX}:${category.id}:${supportRole.id}`)
          .setLabel('Stwórz Ticket')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Primary)
      );

      try {
        await channel.send({ embeds: [embed], components: [row] });
      } catch (error) {
        console.error('Błąd podczas wysyłania panelu ticketów:', error);
        await interaction.reply({
          content: `❌ Nie udało się wysłać panelu na ${channel}. Sprawdź, czy bot ma tam uprawnienia do wysyłania wiadomości.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({ content: `✅ Panel ticketów wysłany na ${channel}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'rekrutacja') {
      const channel = interaction.options.getChannel('kanal');
      const category = interaction.options.getChannel('kategoria');
      const supportRole = interaction.options.getRole('rola-obslugi');
      const acceptRole = interaction.options.getRole('ranga-po-akceptacji');

      const embed = buildApplicationPanelEmbed(supportRole);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${APP_START_PREFIX}:${category.id}:${supportRole.id}:${acceptRole ? acceptRole.id : ''}`)
          .setLabel('Napisz podanie')
          .setEmoji('📝')
          .setStyle(ButtonStyle.Primary)
      );

      try {
        await channel.send({ embeds: [embed], components: [row] });
      } catch (error) {
        console.error('Błąd podczas wysyłania panelu rekrutacji:', error);
        await interaction.reply({
          content: `❌ Nie udało się wysłać panelu na ${channel}. Sprawdź, czy bot ma tam uprawnienia do wysyłania wiadomości.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({ content: `✅ Panel rekrutacji wysłany na ${channel}.`, ephemeral: true });
      return;
    }

    if (subcommand === 'mafia') {
      const channel = interaction.options.getChannel('kanal');

      const embed = buildMafiaPanelEmbed(channel);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${MAFIA_START_PREFIX}:${channel.id}`)
          .setLabel('Stwórz Organizację')
          .setEmoji('🔫')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  },
};
