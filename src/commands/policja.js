const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const registry = require('../utils/registry');
const { RANKS, getRankIndex, getRankByIndex, getRankLabel } = require('../data/policeRanks');
const { requirePoliceRole, requireCommander, getRankKeyFromRoles } = require('../utils/police');
const { sendAdminLog } = require('../utils/adminLog');
const {
  buildSprawdzGraczaEmbed,
  buildMandatEmbed,
  buildGonionyEmbed,
  buildZawieszenieEmbed,
  buildSluzbaEmbed,
  buildRankingEmbed,
  buildAwansEmbed,
  buildCbspEmbed,
} = require('../utils/policeEmbeds');

const builder = new SlashCommandBuilder()
  .setName('policja')
  .setDescription('System policyjny Emergency Hamburg RP');

builder.addSubcommand((sub) => {
  sub.setName('setup').setDescription('Konfiguracja ról systemu policyjnego (jednorazowo, tylko admin)');
  sub.addRoleOption((o) => o.setName('rola-policja').setDescription('Rola dająca dostęp do komend policyjnych').setRequired(true));
  RANKS.forEach((rank) => {
    sub.addRoleOption((o) =>
      o.setName(`ranga-${rank.key}`).setDescription(`Rola odpowiadająca randze: ${rank.label}`).setRequired(true)
    );
  });
  sub.addRoleOption((o) => o.setName('rola-cbsp').setDescription('Opcjonalna rola specjalnej jednostki CBŚP').setRequired(false));
  return sub;
});

builder.addSubcommand((sub) =>
  sub
    .setName('sprawdz-gracza')
    .setDescription('Sprawdza pełny profil gracza po nicku Roblox (dowód, prawo jazdy, pojazdy, mandaty...)')
    .addStringOption((o) => o.setName('nick').setDescription('Nick Roblox gracza').setRequired(true))
);

builder.addSubcommand((sub) =>
  sub
    .setName('mandat')
    .setDescription('Wystawia mandat graczowi')
    .addUserOption((o) => o.setName('gracz').setDescription('Ukarany gracz').setRequired(true))
    .addIntegerOption((o) => o.setName('kwota').setDescription('Kwota mandatu w zł').setMinValue(1).setRequired(true))
    .addStringOption((o) => o.setName('powod').setDescription('Powód wystawienia mandatu').setRequired(true))
);

builder.addSubcommand((sub) =>
  sub
    .setName('goniony')
    .setDescription('Dodaje lub usuwa gracza z listy gończej')
    .addUserOption((o) => o.setName('gracz').setDescription('Gracz').setRequired(true))
    .addStringOption((o) =>
      o
        .setName('akcja')
        .setDescription('Dodaj do listy czy usuń po zatrzymaniu')
        .setRequired(true)
        .addChoices({ name: 'Dodaj (ogłoś poszukiwanie)', value: 'dodaj' }, { name: 'Usuń (zatrzymany)', value: 'usun' })
    )
    .addStringOption((o) => o.setName('powod').setDescription('Powód poszukiwania (wymagany przy dodawaniu)').setRequired(false))
);

builder.addSubcommand((sub) =>
  sub
    .setName('zawieszenie')
    .setDescription('Zawiesza lub przywraca prawo jazdy gracza')
    .addUserOption((o) => o.setName('gracz').setDescription('Gracz').setRequired(true))
    .addStringOption((o) =>
      o
        .setName('akcja')
        .setDescription('Zawieś czy przywróć uprawnienia')
        .setRequired(true)
        .addChoices({ name: 'Zawieś', value: 'zawiesz' }, { name: 'Przywróć', value: 'przywroc' })
    )
    .addStringOption((o) => o.setName('powod').setDescription('Powód zawieszenia (wymagany przy zawieszaniu)').setRequired(false))
);

builder.addSubcommand((sub) => sub.setName('sluzba').setDescription('Rozpoczyna lub kończy Twoją służbę (clock-in/out)'));

builder.addSubcommand((sub) => sub.setName('ranking').setDescription('Ranking aktywności służbowej funkcjonariuszy'));

builder.addSubcommand((sub) =>
  sub
    .setName('awans')
    .setDescription('Awansuje funkcjonariusza o jedną rangę')
    .addUserOption((o) => o.setName('gracz').setDescription('Funkcjonariusz').setRequired(true))
);

builder.addSubcommand((sub) =>
  sub
    .setName('degradacja')
    .setDescription('Degraduje funkcjonariusza o jedną rangę')
    .addUserOption((o) => o.setName('gracz').setDescription('Funkcjonariusz').setRequired(true))
);

builder.addSubcommand((sub) =>
  sub
    .setName('cbsp')
    .setDescription('Przydziela lub odbiera przynależność do CBŚP')
    .addUserOption((o) => o.setName('gracz').setDescription('Funkcjonariusz').setRequired(true))
    .addStringOption((o) =>
      o
        .setName('akcja')
        .setDescription('Dodaj czy usuń z CBŚP')
        .setRequired(true)
        .addChoices({ name: 'Dodaj', value: 'dodaj' }, { name: 'Usuń', value: 'usun' })
    )
);

async function changeRank(interaction, config, direction) {
  if (!(await requireCommander(interaction, config))) return;

  const target = interaction.options.getUser('gracz');
  const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
  if (!targetMember) {
    await interaction.reply({ content: '❌ Nie znaleziono tego gracza na serwerze.', ephemeral: true });
    return;
  }

  if (Object.values(config.rankRoleIds || {}).filter(Boolean).length === 0) {
    await interaction.reply({ content: '⚠️ Drabinka rang nie jest skonfigurowana — użyj najpierw `/policja setup`.', ephemeral: true });
    return;
  }

  const currentKey = registry.getRank(target.id) || getRankKeyFromRoles(targetMember, config.rankRoleIds);
  const currentIndex = currentKey ? getRankIndex(currentKey) : -1;
  const newIndex = currentIndex + direction;

  if (newIndex < 0) {
    await interaction.reply({ content: '❌ Ten gracz nie ma jeszcze żadnej rangi — użyj awansu, aby nadać pierwszą.', ephemeral: true });
    return;
  }
  if (newIndex >= RANKS.length) {
    await interaction.reply({ content: `❌ ${target} ma już najwyższą rangę (${getRankLabel(RANKS[RANKS.length - 1].key)}).`, ephemeral: true });
    return;
  }

  const newRank = getRankByIndex(newIndex);
  const newRoleId = config.rankRoleIds[newRank.key];
  if (!newRoleId) {
    await interaction.reply({ content: `⚠️ Rola dla rangi **${newRank.label}** nie jest skonfigurowana — użyj \`/policja setup\`.`, ephemeral: true });
    return;
  }

  try {
    if (currentKey && config.rankRoleIds[currentKey]) {
      await targetMember.roles.remove(config.rankRoleIds[currentKey]).catch(() => {});
    }
    await targetMember.roles.add(newRoleId);
  } catch (error) {
    console.error('Błąd podczas zmiany roli rangi:', error);
    await interaction.reply({ content: '❌ Nie udało się zmienić roli — sprawdź uprawnienia bota (Manage Roles) i hierarchię ról.', ephemeral: true });
    return;
  }

  registry.setRank(target.id, target.tag, newRank.key);

  const embed = buildAwansEmbed({
    officer: interaction.user,
    target: targetMember,
    action: direction > 0 ? 'awans' : 'degradacja',
    newRankLabel: newRank.label,
  });
  await interaction.reply({ embeds: [embed] });

  await sendAdminLog(interaction.client, {
    title: direction > 0 ? '⬆️ Awans funkcjonariusza' : '⬇️ Degradacja funkcjonariusza',
    description: `**Kto:** ${target} (${target.tag})\n**Nowa ranga:** ${newRank.label}\n**Zatwierdził:** <@${interaction.user.id}>`,
  });
}

module.exports = {
  data: builder,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const config = registry.getConfig();

    if (subcommand === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({ content: '❌ Ta komenda wymaga uprawnień Zarządzaj Serwerem.', ephemeral: true });
        return;
      }

      const policeRoleId = interaction.options.getRole('rola-policja').id;
      const cbspRole = interaction.options.getRole('rola-cbsp');
      const rankRoleIds = {};
      RANKS.forEach((rank) => {
        rankRoleIds[rank.key] = interaction.options.getRole(`ranga-${rank.key}`).id;
      });

      registry.setConfig({ policeRoleId, cbspRoleId: cbspRole ? cbspRole.id : null, rankRoleIds });

      const rankLines = RANKS.map((rank) => `• ${rank.label}: <@&${rankRoleIds[rank.key]}>`).join('\n');
      await interaction.reply({
        content:
          `✅ System policyjny skonfigurowany.\n\n` +
          `**Rola dostępu:** <@&${policeRoleId}>\n` +
          `**CBŚP:** ${cbspRole ? `<@&${cbspRole.id}>` : 'nie skonfigurowano'}\n\n` +
          `**Drabinka rang:**\n${rankLines}`,
        ephemeral: true,
      });
      return;
    }

    if (subcommand === 'sprawdz-gracza') {
      if (!(await requirePoliceRole(interaction, config))) return;

      const nick = interaction.options.getString('nick');
      const discordId = registry.findDiscordIdByRobloxNick(nick);
      const record = discordId ? registry.getUserRecord(discordId) : null;

      const embed = buildSprawdzGraczaEmbed({ nick, discordId, record });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (subcommand === 'mandat') {
      if (!(await requirePoliceRole(interaction, config))) return;

      const target = interaction.options.getUser('gracz');
      const amount = interaction.options.getInteger('kwota');
      const reason = interaction.options.getString('powod');

      registry.addCitation(target.id, target.tag, {
        reason,
        amount,
        issuedBy: interaction.user.id,
        issuedByTag: interaction.user.tag,
      });

      const embed = buildMandatEmbed({ officer: interaction.user, target, amount, reason });
      await interaction.reply({ embeds: [embed] });

      await sendAdminLog(interaction.client, {
        title: '📋 Wystawiono mandat',
        description: `**Kto:** ${target} (${target.tag})\n**Kwota:** ${amount} zł\n**Powód:** ${reason}\n**Funkcjonariusz:** <@${interaction.user.id}>`,
      });
      return;
    }

    if (subcommand === 'goniony') {
      if (!(await requirePoliceRole(interaction, config))) return;

      const target = interaction.options.getUser('gracz');
      const action = interaction.options.getString('akcja');
      const reason = interaction.options.getString('powod');

      if (action === 'dodaj') {
        if (!reason) {
          await interaction.reply({ content: '⚠️ Podaj powód poszukiwania (opcja `powod`).', ephemeral: true });
          return;
        }
        registry.setWanted(target.id, target.tag, { reason, issuedBy: interaction.user.id, issuedByTag: interaction.user.tag });
      } else {
        const removed = registry.clearWanted(target.id);
        if (!removed) {
          await interaction.reply({ content: `ℹ️ ${target} nie był poszukiwany.`, ephemeral: true });
          return;
        }
      }

      const embed = buildGonionyEmbed({ officer: interaction.user, target, action, reason });
      await interaction.reply({ embeds: [embed] });

      await sendAdminLog(interaction.client, {
        title: action === 'dodaj' ? '🚨 Ogłoszono list gończy' : '✅ Zdjęto z listy gończej',
        description: `**Kto:** ${target} (${target.tag})\n**Funkcjonariusz:** <@${interaction.user.id}>${reason ? `\n**Powód:** ${reason}` : ''}`,
      });
      return;
    }

    if (subcommand === 'zawieszenie') {
      if (!(await requirePoliceRole(interaction, config))) return;

      const target = interaction.options.getUser('gracz');
      const action = interaction.options.getString('akcja');
      const reason = interaction.options.getString('powod');
      const suspend = action === 'zawiesz';

      if (suspend && !reason) {
        await interaction.reply({ content: '⚠️ Podaj powód zawieszenia (opcja `powod`).', ephemeral: true });
        return;
      }

      registry.setLicenseSuspended(target.id, target.tag, suspend, {
        reason,
        issuedBy: interaction.user.id,
        issuedByTag: interaction.user.tag,
      });

      const embed = buildZawieszenieEmbed({ officer: interaction.user, target, action, reason });
      await interaction.reply({ embeds: [embed] });

      await sendAdminLog(interaction.client, {
        title: suspend ? '🚫 Zawieszono prawo jazdy' : '✅ Przywrócono prawo jazdy',
        description: `**Kto:** ${target} (${target.tag})\n**Funkcjonariusz:** <@${interaction.user.id}>${reason ? `\n**Powód:** ${reason}` : ''}`,
      });
      return;
    }

    if (subcommand === 'sluzba') {
      if (!(await requirePoliceRole(interaction, config))) return;

      const status = registry.getDutyStatus(interaction.user.id);

      if (!status.onDuty) {
        registry.startDuty(interaction.user.id, interaction.user.tag);
        const embed = buildSluzbaEmbed({ officer: interaction.user, started: true });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        await sendAdminLog(interaction.client, {
          title: '🟢 Rozpoczęto służbę',
          description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})`,
        });
      } else {
        const result = registry.endDuty(interaction.user.id, interaction.user.tag);
        const embed = buildSluzbaEmbed({ officer: interaction.user, started: false, durationMs: result.durationMs });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        await sendAdminLog(interaction.client, {
          title: '🔴 Zakończono służbę',
          description: `**Kto:** <@${interaction.user.id}> (${interaction.user.tag})\n**Czas służby:** ${Math.round(result.durationMs / 60000)} min`,
        });
      }
      return;
    }

    if (subcommand === 'ranking') {
      const ranking = registry.getDutyRanking(10);
      const embed = buildRankingEmbed(ranking);
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (subcommand === 'awans') {
      await changeRank(interaction, config, 1);
      return;
    }

    if (subcommand === 'degradacja') {
      await changeRank(interaction, config, -1);
      return;
    }

    if (subcommand === 'cbsp') {
      if (!(await requireCommander(interaction, config))) return;

      const target = interaction.options.getUser('gracz');
      const action = interaction.options.getString('akcja');
      const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
      const add = action === 'dodaj';

      if (config.cbspRoleId && targetMember) {
        try {
          if (add) {
            await targetMember.roles.add(config.cbspRoleId);
          } else {
            await targetMember.roles.remove(config.cbspRoleId);
          }
        } catch (error) {
          console.error('Błąd podczas zmiany roli CBŚP:', error);
        }
      }

      registry.setCbsp(target.id, target.tag, add);

      const embed = buildCbspEmbed({ officer: interaction.user, target, action });
      await interaction.reply({ embeds: [embed] });

      await sendAdminLog(interaction.client, {
        title: add ? '🕵️ Przydzielono do CBŚP' : '🕵️ Usunięto z CBŚP',
        description: `**Kto:** ${target} (${target.tag})\n**Zatwierdził:** <@${interaction.user.id}>`,
      });
    }
  },
};
