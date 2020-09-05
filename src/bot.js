import { Client, Collection } from 'discord.js';
import path from 'path';
import { registerCmds } from 'register-cmd-discord';

import PresenceController from './app/events/PresenceController';
import CacheController from './app/events/CacheController';
import MessageController from './app/events/MessageController';
import MessageReactionController from './app/events/MessageReactionController';
import UnbannedTimeoutController from './app/events/UnbannedTimeoutController';
import UnmutedTimeoutController from './app/events/UnmutedTimeoutController';
import RegisterInitializedRaffles from './app/utils/registerInitializedRaffles';

class Bot {
	constructor() {
		this.bot = new Client();

		(async () => {
			this.registerCommands();
			this.registerEvents();
			await this.login();
		})();
	}

	registerCommands() {
		const pathCommands = path.resolve(__dirname, 'app', 'commands');
		this.bot.commands = new Collection();
		this.bot.aliases = new Collection();
		const { cmds, als } = registerCmds(
			pathCommands,
			this.bot.commands,
			this.bot.aliases
		);

		this.bot.commands = cmds;
		this.bot.aliases = als;
	}

	async registerEvents() {
		await CacheController.updateCache(this.bot);
		new PresenceController(this.bot);
		new UnbannedTimeoutController(this.bot);
		new UnmutedTimeoutController(this.bot);
		new MessageController(this.bot);
		new MessageReactionController(this.bot);
		new RegisterInitializedRaffles(this.bot);
	}

	async login() {
		try {
			await this.bot.login(process.env.TOKEN);
			console.log('Bot iniciado com sucesso, já pode executar comandos.');
		} catch (error) {
			console.log(
				'Houve um erro ao iniciar o bot, porfavor verifique o token colocado'
			);
			console.log(error);
		}
	}
}

export default Bot;
