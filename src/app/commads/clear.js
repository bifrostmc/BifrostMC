class Clear {
	constructor() {
		this.config = {
			name: 'clear',
			aliases: ['limpar'],
			help:
				'Com esse comando você pode limpar mensagem de acordo com sua escolha.',
			requiredPermissions: ['MANAGE_MESSAGES'],
		};
		this.run = async (_, msg, args, prefix) => {
			const n = Number(args[0]);
			if (!n || n < 1 || n > 100)
				return msg.reply(
					`Sintaxe incorreta por favor digite assim: \`${
						prefix + this.config.name
					} {1/100}\``
				);
			try {
				await msg.channel.bulkDelete(n);
				msg.channel.send(`Você limpou \`${n}\` mensagens.`);
				return true;
			} catch (err) {
				msg.reply('Houve um erro para deletar as mensagens.');
				return false;
			}
		};
	}
}

module.exports = new Clear();
