import { MessageEmbed } from 'discord.js';
import knex from '../database';
import moment from 'moment';

import configuration from '../../../configure';

import checkUserHasPermission from '../utils/checkUserHasPermission';

class Denunciar {
	constructor() {
		this.config = {
			name: 'report',
			aliases: ['denunciar'],
			help:
				'Com esse comando você pode denunciar um usuário que quebrou nossas regras.',
			requiredPermissions: [],
		};

		this.run = async ({ msg, bot, args, prefix }) => {
			const { channel } = msg;

			if (args.length > 0) {
				const userMention =
					msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

				if (!userMention) {
					channel.send(
						configuration.comandos.denunciar.syntaxIncorreta
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
					).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
					return 'O usuário mencionou um usuário inválido.';
				}
				try {

					const channelsDenunciations = await knex('channels').where({
						function: 'denuncias',
						guild_id: msg.guild.id
					});

					if (channelsDenunciations.length <= 0) {
						channel.send(
							configuration.comandos.denunciar.naoAchouCanal
								.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
								.replace('$USERNAME', msg.member.user.username)
								.replace('$USER_TAG', msg.member.user.discriminator)
						).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
						return 'Nenhum canal registrado para receber denúncias.';
					}

					channel.send(
						configuration.comandos.denunciar.naoAchouCanal
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace(
								'$MENTION_TAG',
								`${userMention.user.username}#${userMention.user.discriminator}`
							)
					).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
					const filterReason = (m) => m.author.id === msg.author.id;
					const collectorReason = channel.createMessageCollector(filterReason, {
						time: 1000 * 120,
						max: 1,
					});

					collectorReason.on('collect', (messageReason) => {
						messageReason.delete().catch(() => {});
						if (messageReason.content.toLowerCase() === 'cancelar') {
							channel.send(
								configuration.comandos.denunciar.saiuDenuncia
									.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
									.replace('$USERNAME', msg.member.user.username)
									.replace('$USER_TAG', msg.member.user.discriminator)
									.replace(
										'$MENTION_TAG',
										`${userMention.user.username}#${userMention.user.discriminator}`
									)
							).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
							return;
						}
						channel.send(
							configuration.comandos.denunciar.enviarLinks
								.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
								.replace('$USERNAME', msg.member.user.username)
								.replace('$USER_TAG', msg.member.user.discriminator)
								.replace(
									'$MENTION_TAG',
									`${userMention.user.username}#${userMention.user.discriminator}`
								)
						).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));

						const filterEvidences = (m) => m.author.id === msg.author.id;
						const collectorEvidences = channel.createMessageCollector(
							filterEvidences,
							{
								time: 1000 * 120,
								max: 1,
							}
						);

						collectorEvidences.on('collect', (messageEvidences) => {
							messageEvidences.delete().catch(() => {});

							if (
								messageEvidences.content.includes('http://') ||
								messageEvidences.content.includes('https://')
							) {
								const previewEmbed = new MessageEmbed()
									.setTitle(
										'<:alert:745345548424314881> **Denúncia (Preview)** <:alert:745345548424314881>'
									)
									.setDescription(`**\nMotivo »** ${messageReason.content}`)
									.setThumbnail(bot.user.avatarURL())
									.addField(
										'**Provas » **',
										`\`\`\`yaml\n${messageEvidences}\`\`\``
									)
									.addField(
										'**Usuário denunciado » **',
										`${userMention.user.tag}`
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

								channel
									.send(previewEmbed)
									.then((msgPreview) => msgPreview.delete({ timeout: 5000 }));
								channelsDenunciations.map((channelComplaint) => {
									const channelInGuild = msg.guild.channels.cache.get(
										channelComplaint.channel_id
									);

									if (channelInGuild) {
										const adminEmbedBanned = new MessageEmbed()
											.setTitle(
												'<:734638755859791873:745345548424314881> **Denúncia ** <:734638755859791873:745345548424314881>'
											)
											.setDescription(`**\nMotivo »** ${messageReason.content}`)
											.setThumbnail(bot.user.avatarURL())
											.addField(
												'**Provas » **',
												`\`\`\`yaml\n${messageEvidences}\`\`\``
											)
											.addField(
												'**Usuário denunciado » **',
												`${userMention.user.tag}`
											)
											.addField('**Author » **', `${messageReason.author.tag}`)
											.addField(
												`**Criado em » ** \`${moment().format(
													'DD/MM/YYYY, h:mm:ss a'
												)}\``,
												'\u200B'
											)
											.addField(
												'Clique em <:check_mark_ok:745344787317784648> para confirmar a denúncia e banir o usuário.',
												'Clique em <:check_mark_error:745344786856280085> para cancelar a denúncia assim o usuário não será banido.'
											)
											.setTimestamp()
											.setFooter(
												`Copyright © 2020 ${bot.user.username}`,
												bot.user.avatarURL()
											);
										channelInGuild
											.send(adminEmbedBanned)
											.then(async (messageForAdmin) => {
												await messageForAdmin.react('745344787317784648');
												await messageForAdmin.react('745344786856280085');

												const filter = (reaction, user) => {
													const userReacting = msg.guild.members.cache.get(
														user.id
													);
													return (
														(reaction.emoji.id === '745344786856280085' ||
															reaction.emoji.id === '745344787317784648') &&
														user.id !== msg.author.id &&
														checkUserHasPermission(
															'BAN_MEMBERS',
															userReacting
														) &&
														userReacting.roles.highest.rawPosition >
															userMention.roles.highest.rawPosition
													);
												};
												const collector = messageForAdmin.createReactionCollector(
													filter
												);

												collector.on('collect', async (reaction, user) => {
													switch (reaction.emoji.id) {
														case '745344787317784648':
															messageForAdmin.delete().catch(() => {});
															await messageForAdmin.channel.send(
																configuration.comandos.denunciar.pv.aceitou.admin
																	.replace(
																		'$MENTION_USER_SEND',
																		`<@${msg.author.id}>`
																	)
																	.replace(
																		'$USERNAME',
																		msg.member.user.username
																	)
																	.replace(
																		'$USER_TAG',
																		msg.member.user.discriminator
																	)
																	.replace(
																		'$MENTION_TAG',
																		`${userMention.user.username}#${userMention.user.discriminator}`
																	)
																	.replace('$PREVIEW_REPORT', previewEmbed)
																	.replace(
																		'$GUILD_NAME',
																		msg.channel.guild.name
																	)
															);
															await msg.author.send(
																configuration.comandos.denunciar.pv.aceitou.author
																	.replace(
																		'$MENTION_USER_SEND',
																		`<@${msg.author.id}>`
																	)
																	.replace(
																		'$USERNAME',
																		msg.member.user.username
																	)
																	.replace(
																		'$USER_TAG',
																		msg.member.user.discriminator
																	)
																	.replace(
																		'$MENTION_TAG',
																		`${userMention.user.username}#${userMention.user.discriminator}`
																	)
																	.replace('$PREVIEW_REPORT', previewEmbed)
																	.replace(
																		'$GUILD_NAME',
																		msg.channel.guild.name
																	)
															);
															await userMention.user.send(
																configuration.comandos.denunciar.pv.aceitou.denunciado
																	.replace(
																		'$MENTION_USER_SEND',
																		`<@${msg.author.id}>`
																	)
																	.replace(
																		'$USERNAME',
																		msg.member.user.username
																	)
																	.replace(
																		'$USER_TAG',
																		msg.member.user.discriminator
																	)
																	.replace(
																		'$MENTION_TAG',
																		`${userMention.user.username}#${userMention.user.discriminator}`
																	)
																	.replace('$PREVIEW_REPORT', previewEmbed)
																	.replace(
																		'$GUILD_NAME',
																		msg.channel.guild.name
																	)
															);
															userMention.ban({
																reason: messageReason.content,
															});
															break;
														case '745344786856280085':
															messageForAdmin.channel.send(
																configuration.comandos.denunciar.pv.rejeitou.admin
																	.replace(
																		'$MENTION_USER_SEND',
																		`<@${msg.author.id}>`
																	)
																	.replace(
																		'$USERNAME',
																		msg.member.user.username
																	)
																	.replace(
																		'$USER_TAG',
																		msg.member.user.discriminator
																	)
																	.replace(
																		'$MENTION_TAG',
																		`${userMention.user.username}#${userMention.user.discriminator}`
																	)
																	.replace('$PREVIEW_REPORT', previewEmbed)
																	.replace(
																		'$GUILD_NAME',
																		msg.channel.guild.name
																	)
															);
															msg.author.send(
																configuration.comandos.denunciar.pv.rejeitou.author
																	.replace(
																		'$MENTION_USER_SEND',
																		`<@${msg.author.id}>`
																	)
																	.replace(
																		'$USERNAME',
																		msg.member.user.username
																	)
																	.replace(
																		'$USER_TAG',
																		msg.member.user.discriminator
																	)
																	.replace(
																		'$MENTION_TAG',
																		`${userMention.user.username}#${userMention.user.discriminator}`
																	)
																	.replace('$PREVIEW_REPORT', previewEmbed)
																	.replace(
																		'$GUILD_NAME',
																		msg.channel.guild.name
																	)
																	.replace(
																		'$APLICATOR',
																		`${user.username}#${user.discriminator}`
																	)
															);
															messageForAdmin.delete().catch(() => {});
															break;
														default:
															break;
													}
												});
											});
									}
									return channelComplaint;
								});
								return `O usuário ${msg.author.username} delatou o usuário ${userMention.user.username} por descumprir as regras.`;
							}
							channel.send(
								configuration.comandos.denunciar.linksObrigatorios
									.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
									.replace('$USERNAME', msg.member.user.username)
									.replace('$USER_TAG', msg.member.user.discriminator)
									.replace(
										'$MENTION_TAG',
										`${userMention.user.username}#${userMention.user.discriminator}`
									)
									.replace('$GUILD_NAME', msg.channel.guild.name)
							).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
							return `O usuário ${msg.author.username} não incluiu provas em sua denúncia.`;
						});
					});
				} catch (error) {
					console.log(error);
					channel.send(
						configuration.comandos.denunciar.possivelErro
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace('$ERROR_MESSAGE', error.message)
					).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
					return 'Houve um erro ao se comunicar com o banco de dados.';
				}
			} else {
				channel.send(
					configuration.comandos.denunciar.syntaxIncorreta
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
				).then((msgDelete) => msgDelete.delete({ timeout: 5000 }));
				return 'O usuário digitou o comando em um sintaxe incorreta.';
			}
			return false;
		};
	}
}

module.exports = new Denunciar();
