import { Command } from '@sapphire/framework';
import config from '#rootJson/config' with { type: 'json' };

import {
	ContainerBuilder,
	MessageFlagsBitField,
	StringSelectMenuBuilder,
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
							e[1].selections.map((role) => ({
								emoji: role?.emoji,
								description: role?.description,
								label: role.displayName,
								value: role.roleId
							}))
						)
				)
			);

			return container;
		});

		return message.channel.send({ components: containers, flags: MessageFlagsBitField.Flags.IsComponentsV2 });
	}
}
