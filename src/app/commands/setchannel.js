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

		this.run = async ({ msg, args, prefix, bot }) => {
			const { channel } = msg;

			async function addChannelInDatabase(function_name, name) {
				try {
					const channel_base = await knex('channels').where({
						channel_id: channel.id,
						guild_id: channel.guild.id,
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
							guild_id: channel.guild.id,
							function: function_name,
						},
					]);

					channel
						.send(
							`🎉🎉 Parabéns! <@${msg.author.id}> Você setou esse canal para receber logs das ${name} feitas.`
						)
						.then((msg) => msg.delete({ timeout: 5000 }));
					return `O usuário ${msg.author.username} conseguiu setar o canal ${channel.id} para receber logs de ${name}.`;
				} catch (error) {
					console.log(error);
					channel
						.send(
							configuration.comandos.lock.possivelErro
								.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
								.replace('$USERNAME', msg.member.user.username)
								.replace('$USER_TAG', msg.member.user.discriminator)
								.replace('$ERROR_MESSAGE', error.message)
						)
						.then((msg) => msg.delete({ timeout: 5000 }));
					return 'Houve um erro ao se comunicar com o banco de dados.';
				}
			}

			const channels = {
				banned: {
					formatted: 'banimentos',
					help:
						'Esse chat recebe as atualizações de logs de status de banimento de um usuário.',
				},
				kicked: {
					formatted: 'expulsões',
					help:
						'Nesse chat recebe as logs de expulsões feitas dentro do serivdor.',
				},
				sugestoes: {
					formatted: 'sugestões',
					help:
						'Você pode setar esse canal para receber as sugestões dos usuários.',
				},
				rebaixamentos: {
					formatted: 'rebaixamentos',
					help:
						'Esse chat recebe as atualizações de logs de demote a um usuário.',
				},
				promocoes: {
					name: 'promocoes',
					formatted: 'promoções',
					help:
						'Esse chat recebe as atualizações de logs de promote a um usuário.',
				},
				denuncias: {
					formatted: 'denúncias',
					help:
						'Esse chat recebe as logs de denúncias que os usuários relatam.',
				},
				raffle: {
					formatted: 'sorteios',
					help:
						'Esse chat recebe as logs de soterios que os usuários faz giveaways.',
				},
				muted: {
					formatted: 'muted',
					help:
						'Agora esse canal receberá os avisos de silenciamento.',
				},
			};

			if (args[0]) {
				if (args[0] === 'list') {
					const listChannels = new Map(Object.entries(channels));
					const embedChannels = new MessageEmbed()
						.setTitle('**Lista dos meus canaís disponíveis**')
						.setThumbnail(bot.user.avatarURL())
						.setTimestamp()
						.setFooter(
							`Copyright © 2020 ${bot.user.username}`,
							bot.user.avatarURL()
						);
					embedChannels.addField(`\u200B`, `\u200B`, false);
					listChannels.forEach(({ help }, name) => {
						embedChannels.addField(
							`\u200B`,
							`\`${prefix}setchannel ${name}\` » \`\`\`yaml\n${help}\`\`\``,
							false
						);
					}, listChannels);
					msg.channel.send(embedChannels);
					return 'O usuário veio ver a lista de canais disponíveis.';
				}
				if (channels[args[0]]) {
					addChannelInDatabase(args[0], channels[args[0]].formatted);

					return `O usuário executou comando para setar o canal ${args[0]} em ${msg.channel.id}`;
				}

				channel.send(`Nenhuma sincronização de canal feita com esse nome.`);
				channel.send(
					`Para saber os tipos de canais digite ${prefix}setchannel list`
				);
				return `O usuário executou o comando porém digitou um tipo de canal inválido.`;
			}
			channel
				.send(
					`Sintaxe incorreta, porfavor use dessa forma ${prefix}setchannel {tipo de canal}\nPara saber os tipos de canais digite ${prefix}setchannel list`
				)
				.then((msgSyntaxError) => msgSyntaxError.delete({ timeout: 5000 }));
			return 'O usuário digitou o comando em uma syntax incorreta';
		};
	}
}

module.exports = new SetChannel();
