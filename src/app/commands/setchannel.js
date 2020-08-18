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

			async function addChannelInDatabase(function_name, name) {
				try {
					const channel_base = await knex('channels').where({
						channel_id: channel.id,
						function: function_name,
					});
					if (channel_base.length > 0) {
						channel.send(
							`⁉️ <@${msg.author.id}>, Esse canal já está recebendo as logs de ${name} ⁉️`
						);
						return `O canal especificado já está setado como um canal de ${name}.`;
					}
					await knex('channels')
						.where({
							function: function_name,
						})
						.del();

					await knex('channels').insert([
						{
							channel_id: channel.id,
							function: function_name,
						},
					]);

					channel.send(
						`🎉🎉 Parabéns! <@${msg.author.id}> Você setou esse canal para receber logs das ${name} feitas.`
					);
					return `O usuário ${msg.author.username} conseguiu setar o canal ${channel.id} para receber logs de ${name}.`;
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
			}

			if (args[0]) {
				switch (args[0]) {
					case 'promocoes':
						addChannelInDatabase('promocoes', 'promoções');
						break;
					case 'denuncias':
						addChannelInDatabase('denuncias', 'denúncias');
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
