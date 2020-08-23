import { MessageEmbed } from 'discord.js';
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
						`⁉️ Você digitou um usuário inválido, porfavor digite dessa forma \`${prefix}denunciar {@user/user_id}\` ⁉️`
					);
					return 'O usuário mencionou um usuário inválido.';
				}
				try {
					const channel_base = bot.cache_control.channels.filter(
						(cachedChannel) => cachedChannel.function === 'denuncias'
					);

					if (channel_base.length <= 0) {
						channel.send(
							`⁉️ <@${msg.author.id}>, nenhum canal registrado para receber denúncias. ⁉️`
						);
						return 'Nenhum canal registrado para receber denúncias.';
					}

					channel.send(
						`❗ Digite o motivo da denúncia ao usuário \`${userMention.user.username}#${userMention.user.discriminator}\`. (2 Minutos) (Obrigatório) ❗`
					);
					channel.send(`Digite \`cancelar\` para sair da sessão de denúncia.`);
					const filterReason = (m) => m.author.id === msg.author.id;
					const collectorReason = channel.createMessageCollector(filterReason, {
						time: 1000 * 120,
						max: 1,
					});

					collectorReason.on('collect', (messageReason) => {
						messageReason.delete().catch(() => {});
						if (messageReason.content.toLowerCase() === 'cancelar') {
							channel.send(
								'<:check_error:745344787087098008> Você saiu da sessão de denúncia com sucesso, você pode abrir outra a qualquer momento. <:check_error:745344787087098008>'
							);
							return;
						}
						channel.send(
							`<:alert:745345548424314881> Agora envie links para comprovar sua denúncia (Obrigatório) <:alert:745345548424314881>`
						);

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
								channel_base.map((channelComplaint) => {
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
																'🎉 O usuário foi banido com sucesso! Obrigado pela colaboração 🎉'
															);
															await msg.author.send(
																`🎉 Parabéns sua denúncia ao usuário \`${userMention.user.username}#${userMention.user.discriminator}\` foi aprovada, o usuário já foi banido de nosso discord, por \`${user.username}#${user.discriminator}\`. 🎉`
															);
															await msg.author.send(
																`Agradecemos pela sua colaboração e pedimos que continue a reportar novos possíveis infratores.`
															);
															await userMention.user.send(
																`<:check_error:745344787087098008> Você foi denúnciado e recebeu um ban, de nosso servidor \`${msg.channel.guild.name}\`, veja a denúncia logo abaixo <:check_error:745344787087098008>`
															);
															await userMention.user.send(previewEmbed);
															userMention.ban({
																reason: messageReason.content,
															});
															break;
														case '745344786856280085':
															messageForAdmin.channel.send(
																'🎉 O usuário foi liberado com sucesso! Obrigado pela colaboração 🎉'
															);
															msg.author.send(
																`<:check_error:745344787087098008> Infelizmente sua denúncia ao usuário \`${userMention.user.username}#${userMention.user.discriminator}\` foi desaprovada, caso tenha alguma dúvida entre em contato com \`${user.username}#${user.discriminator}\`. <:check_error:745344787087098008>`
															);
															msg.author.send(
																`Agradecemos pela sua colaboração e pedimos que continue a reportar novos possíveis infratores.`
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
								'Você não incluiu links de referências para imagens/videos, então sua denúncia foi cancelada por esse motivo.'
							);
							return `O usuário ${msg.author.username} não incluiu provas em sua denúncia.`;
						});
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
			} else {
				channel.send(
					`⁉️ Sintaxe incorreta, use dessa forma \`${prefix}denunciar {@user/user_id}\`, após executar o comando iniciará uma sessão de perguntas para a denuncia ser concluída ⁉️`
				);
				return 'O usuário digitou o comando em um sintaxe incorreta.';
			}
			return false;
		};
	}
}

module.exports = new Denunciar();
