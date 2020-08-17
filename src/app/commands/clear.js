import configuration from '../../../configure';

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
			if (!n || n < 1 || n > 100 || args[0]) {
				msg.reply(
					`Sintaxe incorreta por favor digite assim: \`${
						prefix + this.config.name
					} {1/100/all}\``
				);
				return `O usuário mencionou um número inválido para a limpeza.`;
			}
			try {
				await msg.channel.bulkDelete(n);
				msg.channel.send(
					configuration.comandos.clear.apagouMensagens
						.replace('$MESSAGES_DELETED', n)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
				);
				return `Com esse comando o usuário apagou ${n} mensagens, no canal ${msg.channel.id}.`;
			} catch (err) {
				console.log(err);
				msg.reply(
					configuration.comandos.clear.apagouMensagens
						.replace('$MESSAGES_DELETED', n)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$ERROR_MESSAGE', err.message)
				);
				return `Houve um erro ao usuário executar esse comando.`;
			}
		};
	}
}

module.exports = new Clear();
