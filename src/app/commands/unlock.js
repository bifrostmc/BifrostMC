import Discord from 'discord.js';
import configuration from '../../../configure';

class UnLock {
	constructor() {
		this.config = {
			name: 'unlock',
			aliases: ['desbloquear'],
			help:
				'Com esse comandos os administradores pode alterar o estado do canal para desbloqueado.',
			requiredPermissions: ['MANAGE_CHANNELS'],
		};

		this.run = async ({ msg }) => {
			const { channel } = msg;
			const { deny } = msg.channel.permissionOverwrites.find(
				(role) => role.id === channel.guild.roles.everyone.id
			);

			if (deny.toArray().indexOf('SEND_MESSAGES') === -1) {
				msg.reply(
					configuration.comandos.unlock.jaBloqueado
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
				);
				return `O canal ${channel.id} já está desbloqueado.`;
			}

			try {
				await channel.updateOverwrite(
					channel.guild.roles.everyone,
					{
						SEND_MESSAGES: true,
					},
					`Esse canal foi desbloqueado, por ${msg.author.username}`
				);
				channel.send(
					configuration.comandos.unlock.desbloquear
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
				);
				return `O canal ${channel.id} foi desbloqueado com sucesso!`;
			} catch (error) {
				console.log(error);
				channel.send(
					configuration.comandos.unlock.possivelErro
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$ERROR_MESSAGE', error.message)
				);
				return `Houve um erro ao desbloquear o canal ${channel.id}`;
			}
		};
	}
}

module.exports = new UnLock();
