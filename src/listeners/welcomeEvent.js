import { Listener } from '@sapphire/framework';

export class welcomeEvent extends Listener {
	/**
	 * @param {Listener.LoaderContext} context
	 */
	constructor(context) {
		super(context, {
			// Any Listener options you want here
			name: 'welcomeEvent',
			event: 'guildMemberAdd'
		});
	}

	/**
	 *
	 * @param {import('discord.js').GuildMember} member
	 * @returns {Promise<void>}
	 */
	async run(member) {
		try {
			console.log('guildMemberAdd', member);

			const welcomeChannel = this.container.client.channels.cache.find(channel => channel.id === '1415841075112837221');

			await welcomeChannel.send({ content: 'This is a test welcome message'});

		} catch (e) {
			this.container.logger.error(`welcomeEvent ${e}`);
		}
	}
}
