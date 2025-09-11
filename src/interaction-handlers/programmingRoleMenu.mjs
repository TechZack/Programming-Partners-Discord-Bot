import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import config from '#rootJson/config' with { type: 'json' }
import { ContainerBuilder, EmbedBuilder, MessageFlagsBitField, StringSelectMenuBuilder } from 'discord.js';


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

			// Update the UI
			await this.resetContainer(interaction);
			await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

			// Check to see if role exists in Guild
			const guildRole =  await interaction.guild.roles.cache.find(r => r.id === interaction.values[0]);
			// Checks to see if the user has this role
			const userHasRole = await interaction.member.roles.cache.find(r => r.id === interaction.values[0]);

			if (!userHasRole && guildRole) {
				// Add Role
				await interaction.member.roles.add(guildRole, 'Self-Service Role Addition via Role Menu');
				const addedEmbed = new EmbedBuilder()
					.setTitle(`${guildRole.name} role has been added`)
					.setDescription(`If you would like to remove ${guildRole.name} role then please re-select the ${guildRole.name} in the list above.`)
					.setColor('#25E52B');

				await interaction.editReply({ embeds: [addedEmbed] });
			} else {
				// Remove Role
				await interaction.member.roles.remove(guildRole, 'Self-Service Role Removal via Role Menu');

				const removedEmbed = new EmbedBuilder()
					.setTitle(`${guildRole.name} role has been removed`)
					.setDescription(`If you would like to add ${guildRole.name} role back then please re-select the ${guildRole.name} in the list above.`)
					.setColor('#D72323');

				await interaction.editReply({ embeds: [removedEmbed] });
			}
		} catch (e) {
			this.container.logger.error(`programmingRoleMenu ${e}`);
			await interaction.editReply('There has been an error, please try again or contact a member of staff.');
		}
	}

	/**
	 * @param {import('discord.js').StringSelectMenuInteraction} interaction
	 */
	parse(interaction) {
		if (interaction.customId !== 'programming-role-selection') return this.none();

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
			const containerComponent = new ContainerBuilder()
				.addTextDisplayComponents(
					textDisplay => textDisplay
						.setContent('# Programming Roles')
				)
				.addActionRowComponents(
					actionRowBuilder => actionRowBuilder
						.setComponents(
							new StringSelectMenuBuilder()
								.setCustomId('programming-role-selection')
								.setPlaceholder("Select a role")
								.setMinValues(0)
								.setMaxValues(1) // Set due to Discord Limitations
								.addOptions(
									config.rolemenus['programming-role-selection'].map(role => {
										return role?.emoji ? {label: role.displayName, value: role.roleId, emoji: role.emoji} : {label: role.displayName, value: role.roleId};
									})
								)
						)
				);

			await interaction.message.edit({ components: [containerComponent] });
		} catch (e) {
			this.container.logger.error(`programmingRoleMenu::resetContainer ${e}`);
		}
	}
}
