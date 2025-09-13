import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import config from '#rootJson/config' with { type: 'json' };
import { ContainerBuilder, EmbedBuilder, GuildMemberRoleManager, MessageFlagsBitField, Role, StringSelectMenuBuilder } from 'discord.js';

export class MenuHandler extends InteractionHandler {
	/**
	 * @param {InteractionHandler.LoaderContext} context
	 * @param {InteractionHandler.Options} options
	 */
	constructor(context, options) {
		super(context, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.SelectMenu
		});
	}

	/**
	 * @param {import('discord.js').StringSelectMenuInteraction} interaction
	 */
	async run(interaction) {
		try {
			// If Empty - DeferUpdate to avoid errors showing on Discord UI.
			if (interaction.values.length === 0) return interaction.deferUpdate();
			await this.resetContainer(interaction);
			await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

			const menu = config.rolemenus.find((e) => e.id === interaction.customId);
			/** @type {EmbedBuilder} */
			let embed;
			/** @type {GuildMemberRoleManager} */
			// @ts-ignore
			const roleManager = interaction.member.roles;

			// Check to see if role exists in Guild
			const guildRole = await interaction.guild.roles.cache.find((r) => r.id === interaction.values[0]);
			// Checks to see if the user has this role
			const userHasRole = await roleManager.cache.find((r) => r.id === interaction.values[0]);

			switch (menu.type) {
				case 'single':
					if (userHasRole && guildRole) {
						await roleManager.remove(guildRole, 'Self-Service Role Removal via Role Menu');

						embed = new EmbedBuilder()
							.setTitle(`${guildRole.name} role has been removed`)
							.setDescription(`You can select a new role from the list above.`)
							.setColor('#D72323');
					} else {
                        /** @type {Role} */
						// Check if another role from the list already exists, then remove it if it does
						let existingRole = undefined;

						for (const role of menu.selections) {
							const getRole = roleManager.cache.get(role.roleId);

							if (getRole) {
								existingRole = getRole;
								break;
							}
						}

						if (existingRole) {
							await roleManager.remove(existingRole, 'Self-Service Role Removal via Role Menu');
						}

						await roleManager.add(guildRole, 'Self-Service Role Addition via Role Menu');

						embed = new EmbedBuilder()
							.setTitle(`${guildRole.name} role has been added`)
							.setDescription(`You can select a new role from the list above.`)
							.setColor('#25E52B');
					}

					break;
				case 'multi':
					if (!userHasRole && guildRole) {
						await roleManager.add(guildRole, 'Self-Service Role Addition via Role Menu');

						embed = new EmbedBuilder()
							.setTitle(`${guildRole.name} role has been added`)
							.setDescription(`You can select a new role from the list above.`)
							.setColor('#25E52B');
					} else {
						await roleManager.remove(guildRole, 'Self-Service Role Removal via Role Menu');

						embed = new EmbedBuilder()
							.setTitle(`${guildRole.name} role has been removed`)
							.setDescription(
								`If you would like to add ${guildRole.name} role back then please re-select the ${guildRole.name} in the list above.`
							)
							.setColor('#D72323');
					}

					break;
				default:
					console.log('Unhandled type, will error!');
					break;
			}

			await interaction.editReply({ embeds: [embed] });
		} catch (e) {
			this.container.logger.error(`programmingRoleMenu ${e}`);
			await interaction.editReply('There has been an error, please try again or contact a member of staff.');
		}
	}

	/**
	 * @param {import('discord.js').StringSelectMenuInteraction} interaction
	 */
	parse(interaction) {
		if (!config.rolemenus.map((e) => e.id).includes(interaction.customId)) {
			return this.none();
		}

		return this.some();
	}

	/**
	 * Allows to be able to reset the String Menus to the default placeholder as Discord has no way of doing this at the moment.
	 *
	 * @param interaction
	 * @returns {Promise<void>}
	 */
	async resetContainer(interaction) {
		try {
			const containers = Object.entries(config.rolemenus).map((e) => {
				const container = new ContainerBuilder();

				e[1].contents.forEach((content) => {
					container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(content));
				});

				container.addActionRowComponents((ActionRowBuilder) =>
					ActionRowBuilder.setComponents(
						new StringSelectMenuBuilder()
							.setCustomId(e[1].id)
							.setPlaceholder(e[1].placeholder)
							.setMinValues(0)
							.setMaxValues(1)
							.addOptions(
								e[1].selections.map((role) =>
									role?.emoji
										? { label: role.displayName, value: role.roleId, emoji: role.emoji }
										: { label: role.displayName, value: role.roleId }
								)
							)
					)
				);

				return container;
			});

			await interaction.message.edit({ components: containers });
		} catch (e) {
			this.container.logger.error(`programmingRoleMenu::resetContainer ${e}`);
		}
	}
}
