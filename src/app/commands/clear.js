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
		this.run = async ({ msg, args, prefix }) => {
			const n = Number(args[0]);
			if (!n || n < 1 || n > 100) {
				msg.reply(
					`Sintaxe incorreta por favor digite assim: \`${
						prefix + this.config.name
					} {1/100}\``
				).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));;
				return `O usuário mencionou um número inválido para a limpeza.`;
			}
			try {
				await msg.channel.bulkDelete(n);
				msg.channel.send(
					configuration.comandos.clear.apagouMensagens
						.replace('$MESSAGES_DELETED', n)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
				).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));;
				return `Com esse comando o usuário apagou ${n} mensagens, no canal ${msg.channel.id}.`;
			} catch (error) {
				console.log(error);
				msg.reply(
					configuration.comandos.clear.errorApagarMensagem
						.replace('$MESSAGES_DELETED', n)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$ERROR_MESSAGE', error.message)
				).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));;
				return `Houve um erro ao usuário executar esse comando.`;
			}
		};
	}
}

module.exports = new Clear();
