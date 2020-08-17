import { Client } from 'discord.js';

class Bot {
	constructor() {
		this.bot = new Client();

		this.login();
	}

	async login() {
		try {
			await this.bot.login('process.env.TOKEN');
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
