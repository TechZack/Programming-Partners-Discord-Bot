import { Command } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import config from '#rootJson/config' with { type: 'json' };

import {
	ActionRowBuilder,
	ContainerBuilder, MessageFlagsBitField,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
	TextDisplayBuilder
} from 'discord.js';

export class RoleMenuSetup extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'roleMenuSetup',
			description: 'ping pong'
		});
	}

	async messageRun(message) {

		await message.delete();

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

		return message.channel.send({ components: [containerComponent], flags: MessageFlagsBitField.Flags.IsComponentsV2 });
	}
}
