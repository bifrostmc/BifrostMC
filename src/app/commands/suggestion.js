import { MessageEmbed } from 'discord.js';
import moment from 'moment';

import knex from '../database';
import configuration from '../../../configure';

import checkUserHasPermission from '../utils/checkUserHasPermission';

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
						channel.send(
							'<:check_error:745344787087098008> Você saiu da sessão de sugestão com sucesso, você pode abrir outra a qualquer momento. <:check_error:745344787087098008>'
						);
						return;
					}
					const description = `**Sugestão » ** \n\`\`\`yaml\n${messageReason.content}\`\`\``;

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

								try {
									await knex('suggestions').insert([
										{
											channel_id: channel.id,
											message_id: embedToAdmin.id,
											author_id: msg.author.id,
										},
									]);

									await embedToAdmin.react('745344787317784648');
									await embedToAdmin.react('745344786856280085');

									const functionsCollection = {
										'745344787317784648': async (reaction, user) => {
											await msg.author.send(
												`🎉 Parabéns sua sugestão abaixo foi aprovada, pelo admnistrador \`${user.username}#${user.discriminator}\`. 🎉`
											);
											await msg.author.send(previewEmbed);
											await channelInGuild
												.send(
													'🎉 A sugestão foi aprovada com sucesso! Obrigado pela colaboração 🎉'
												)
												.then((msg) => msg.delete({ timeout: 15000 }));
										},
										'745344786856280085': async (reaction, user) => {
											await msg.author.send(
												`<:alert:745345548424314881> Infelizmente sua sugestão abaixo foi reprovado, pelo admnistrador \`${user.username}#${user.discriminator}\`. <:alert:745345548424314881>`
											);
											await msg.author.send(previewEmbed);
											await channelInGuild
												.send(
													'<:check_error:745344787087098008> A sugestão foi reprovado com sucesso! Obrigado pela colaboração <:check_error:745344787087098008>'
												)
												.then((msg) => msg.delete({ timeout: 15000 }));
										},
									};

									const filter = (reaction, user) =>
										(reaction.emoji.id === '745344786856280085' ||
											reaction.emoji.id === '745344787317784648') &&
										!!functionsCollection[
											reaction.emoji.id || reaction.emoji.name
										] &&
										user.id !== msg.author.id;

									const collector = embedToAdmin.createReactionCollector(
										filter
									);

									collector.on('collect', async (reaction, user) => {
										const emoji = reaction.emoji.id || reaction.emoji.name;

										embedToAdmin.delete();
										const functionExecution = functionsCollection[emoji];
										functionExecution(reaction, user);
									});
								} catch (error) {
									console.log(error);
									embedToAdmin.delete();
									channel.send(
										configuration.comandos.lock.possivelErro
											.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
											.replace('$USERNAME', msg.member.user.username)
											.replace('$USER_TAG', msg.member.user.discriminator)
											.replace('$ERROR_MESSAGE', error.message)
									);
								}
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
