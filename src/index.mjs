import '#lib/setup';
import config from '#rootJson/config' with { type: 'json' };
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import 'dotenv/config'
import { configDotenv } from 'dotenv';

const client = new SapphireClient({
	defaultPrefix: config.prefix,
	caseInsensitivePrefixes: true,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true
});

const main = async () => {
	try {
		// Set .env outside of SRC Folder
		configDotenv({path: '../.env'});
		// Logging in Process
		client.logger.info('Logging in');
		await client.login(process.env.DISCORD_TOKEN);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
