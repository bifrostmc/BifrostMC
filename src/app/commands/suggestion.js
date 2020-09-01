import { MessageEmbed } from 'discord.js';
import moment from 'moment';

import knex from '../database';
import configuration from '../../../configure';

import CacheController from '../events/CacheController';

class Suggestion {
	constructor() {
		this.config = {
			name: 'suggestion',
			aliases: ['sugerir'],
			help:
				'Com esse comando você pode levantar uma questão para nossa equipe trabalhar.',
			requiredPermissions: [],
		};

		this.run = async ({ msg, bot, args, prefix }) => {
			const { channel } = msg;

			try {
				const channel_base = await knex('channels').where({
					function: 'sugestoes',
				});

				if (channel_base.length <= 0) {
					channel.send(
						`⁉️ <@${msg.author.id}>, nenhum canal registrado para receber sugestões. ⁉️`
					);
					return 'Nenhum canal registrado para receber sugestões.';
				}

				channel.send(
					`❗ **Digite o conceito da sua sugestão (5 Minutos) (\*)** ❗\nNós usamos formatação de texto para mostrar sua sugestão, então pedimos que não use formatações como: \n\`Inline Code\` \`\`\`yaml\nBlock code\`\`\`\n\nDigite \`cancelar\` para sair da sessão de sugestão.`
				);
				const filterReason = (m) => m.author.id === msg.author.id;
				const collectorReason = channel.createMessageCollector(filterReason, {
					time: 300000,
					max: 1,
				});

				collectorReason.on('collect', async (messageReason) => {
					messageReason.delete().catch(() => {});
					if (messageReason.content.length >= 1792) {
						channel.send(
							'<:check_error:745344787087098008> **Calmai ai**! Você digitou uma sugestão muito grande, aceitamos sugestões com menos de 1792 caractéres. <:check_error:745344787087098008>'
						);

						return;
					}
					if (messageReason.content.toLowerCase() === 'cancelar') {
						channel
							.send(
								'<:check_error:745344787087098008> Você saiu da sessão de sugestão com sucesso, você pode abrir outra a qualquer momento. <:check_error:745344787087098008>'
							)
							.then((msg) => msg.delete({ timeout: 5000 }));
						return;
					}

					const previewEmbed = new MessageEmbed()
						.setTitle(
							'<:alert:745345548424314881> **Sugestão (Preview)** <:alert:745345548424314881>'
						)
						.setThumbnail(msg.author.avatarURL())
						.setDescription(
							`**Sugestão » ** \n\`\`\`yaml\n${messageReason.content}\`\`\``
						)
						.addField('**Author » **', `${messageReason.author.tag}`)
						.addField(
							`**Criado em » ** \`${moment().format(
								'DD/MM/YYYY, h:mm:ss a'
							)}\``,
							'\u200B'
						)
						.setTimestamp()
						.setFooter(
							`Copyright © 2020 ${bot.user.username}`,
							bot.user.avatarURL()
						);

					try {
						const messagePreview = await channel.send(previewEmbed);
						messagePreview.delete({ timeout: 30000 });

						channel_base.map(async (channelComplaint) => {
							const channelInGuild = msg.guild.channels.cache.get(
								channelComplaint.channel_id
							);

							const embedForAdminMessage = new MessageEmbed()
								.setTitle(
									'<:alert:745345548424314881> **Sugestão** <:alert:745345548424314881>'
								)
								.setThumbnail(msg.author.avatarURL())
								.setDescription(
									`**Sugestão » ** \n\`\`\`yaml\n${messageReason.content}\`\`\``
								)
								.addField('**Author » **', `${messageReason.author.tag}`)
								.addField(
									`**Criado em » ** \`${moment().format(
										'DD/MM/YYYY, h:mm:ss a'
									)}\``,
									'\u200B'
								)
								.addField(
									`Clique em <:check_mark_ok:745344787317784648> para aprovar a sugestão.`,
									`Clique em <:check_mark_error:745344786856280085> para reprovar a sugestão.\nCom apenas 1 aprovação ou reprovação será o resultado dessa sugestão. (Vote consciente)`
								)
								.setTimestamp()
								.setFooter(
									`Copyright © 2020 ${bot.user.username}`,
									bot.user.avatarURL()
								);

							try {
								const embedToAdmin = await channelInGuild.send(
									embedForAdminMessage
								);

								await knex('suggestions').insert([
									{
										guild_id: msg.guild.id,
										channel_id: channelComplaint.channel_id,
										message_id: embedToAdmin.id,
										author_id: msg.author.id,
									},
								]);

								await embedToAdmin.react('745344787317784648');
								await embedToAdmin.react('745344786856280085');

								CacheController.updateCache(bot, 'suggestions');
							} catch (error) {
								console.log(error);
								channel.send(
									configuration.comandos.lock.possivelErro
										.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
										.replace('$USERNAME', msg.member.user.username)
										.replace('$USER_TAG', msg.member.user.discriminator)
										.replace('$ERROR_MESSAGE', error.message)
								);
							}
						});
					} catch (error) {
						console.log(error);
						channel.send(
							configuration.comandos.lock.possivelErro
								.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
								.replace('$USERNAME', msg.member.user.username)
								.replace('$USER_TAG', msg.member.user.discriminator)
								.replace('$ERROR_MESSAGE', error.message)
						);
					}
				});
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
		};
	}
}

module.exports = new Suggestion();
