import { MessageEmbed } from 'discord.js';
import knex from '../database';
import configuration from '../../../configure';

class SetChannel {
	constructor() {
		this.config = {
			name: 'setchannel',
			aliases: ['setarcanal', 'setc', 'sc'],
			help:
				'Esse comando serve para setar uma funcionalidade para o canal atual.',
			requiredPermissions: ['MANAGE_CHANNELS'],
		};

		this.run = async ({ msg, bot, args, prefix }) => {
			const { channel } = msg;

			if (args[0]) {
				switch (args[0]) {
					case 'denuncias':
						try {
							const channel_base = await knex('channels').where({
								channel_id: channel.id,
								function: 'denuncias',
							});
							if (channel_base.length > 0) {
								channel.send(
									`⁉️ <@${msg.author.id}>, Esse canal já está recebendo as logs de denúncias ⁉️`
								);
								return 'O canal especificado já está setado como um canal de denúncias.';
							}
							await knex('channels')
								.where({
									function: 'denuncias',
								})
								.del();

							await knex('channels').insert([
								{
									channel_id: channel.id,
									function: 'denuncias',
								},
							]);

							channel.send(
								`🎉🎉 Parabéns! <@${msg.author.id}> Você setou esse canal para receber logs das denúncias feitas.`
							);
							return `O usuário ${msg.author.username} conseguiu setar o canal ${channel.id} para receber logs de denúncias.`;
						} catch (error) {
							console.log(error);
							channel.send(
								configuration.comandos.lock.possivelErro
									.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
									.replace('$USERNAME', msg.member.user.username)
									.replace('$USER_TAG', msg.member.user.discriminator)
									.replace('$ERROR_MESSAGE', error.message)
							);
							return 'Houve um erro ao se comunicar com o banco de dados.';
						}
						break;
					default:
						break;
				}
			} else {
				channel.send(
					`Sintaxe incorreta, porfavor use dessa forma ${prefix}setchannel {tipo de canal}`
				);
				channel.send(
					`Para saber os tipos de canais digite ${prefix}setchannel list`
				);
			}
		};
	}
}

module.exports = new SetChannel();
