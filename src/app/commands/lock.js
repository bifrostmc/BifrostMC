import Discord from 'discord.js';
import configuration from '../../../configure';

class Lock {
	constructor() {
		this.config = {
			name: 'lock',
			aliases: ['bloquear'],
			help:
				'Com esse comandos os administradores pode alterar o estado do canal para bloqueado.',
			requiredPermissions: ['MANAGE_CHANNELS'],
		};

		this.run = async ({ msg }) => {
			const { channel } = msg;
			const { deny } = msg.channel.permissionOverwrites.find(
				(role) => role.id === channel.guild.roles.everyone.id
			);

			console.log(deny.toArray().indexOf('SEND_MESSAGES'));
			if (deny.toArray().indexOf('SEND_MESSAGES') !== -1) {
				msg.channel.send(
					configuration.comandos.lock.jaBloqueado
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
				);
				return `O canal ${channel.id} já está bloqueado.`;
			}

			try {
				await channel.updateOverwrite(
					channel.guild.roles.everyone,
					{
						SEND_MESSAGES: false,
					},
					`Esse canal foi bloqueado, por ${msg.author.username}`
				);
				channel.send(
					configuration.comandos.lock.jaBloqueado
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
				);
				return `O canal ${channel.id} foi bloqueado com sucesso!`;
			} catch (error) {
				console.log(error);
				channel.send(
					configuration.comandos.lock.possivelErro
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$ERROR_MESSAGE', error.message)
				);
				return `Houve um erro ao bloquear o canal ${channel.id}`;
			}
		};
	}
}

module.exports = new Lock();
