import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import knex from '../database';
import configuration from '../../../configure';

class Denunciar {
	constructor() {
		this.config = {
			name: 'denunciar',
			aliases: [],
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
				} else {
					try {
						const channel_base = await knex('channels').where({
							function: 'denuncias',
						});

						if (channel_base.length <= 0) {
							channel.send(
								`⁉️ <@${msg.author.id}>, nenhum canal registrado para receber denúncias. ⁉️`
							);
							return 'Nenhum canal registrado para receber denúncias.';
						}

						channel.send(
							`❗ Digite o motivo da denúncia ao usuário \`${userMention.user.username}#${userMention.user.discriminator}\`. (2 Minutos) (Obrigatório) ❗`
						);
						channel.send(
							`Digite \`cancelar\` para sair da sessão de denúncia.`
						);
						const filterReason = (m) => m.author.id === msg.author.id;
						const collectorReason = channel.createMessageCollector(
							filterReason,
							{
								time: 1000 * 120,
								max: 1,
							}
						);

						collectorReason.on('collect', (messageReason) => {
							messageReason.delete().catch(() => {});
							if (messageReason.content.toLowerCase() === 'cancelar') {
								channel.send(
									'❌ Você saiu da sessão de denúncia com sucesso, você pode abrir outra a qualquer momento. ❌'
								);
								return;
							}
							channel.send(
								`❗ Agora envie links para comprovar sua denúncia (Obrigatório) ❗`
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
										.setTitle('📣 **Denúncia (Preview)** 📣')
										.setDescription(`**\nMotivo »** ${messageReason.content}`)
										.setThumbnail(bot.user.avatarURL())
										.addField(
											'**Provas » **',
											`\`\`\`yaml\n${messageEvidences}\`\`\``
										)
										.addField(
											'**Usuário denunciado » **',
											`<@${userMention.id}>`
										)
										.addField('**Author » **', `<@${messageReason.author.id}>`)
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

									channel.send(previewEmbed);
									channel_base.map((channelComplaint) => {
										const channelInGuild = msg.guild.channels.cache.get(
											channelComplaint.channel_id
										);

										if (channelInGuild) {
											previewEmbed
												.addField(
													'Clique em ✅ para confirmar a denúncia e banir o usuário',
													'Clique em ❌ para cancelar a denúncia assim o usuário não será banido'
												)
												.setTitle('📣 **Denúncia ** 📣');
											channelInGuild
												.send(previewEmbed)
												.then(async (messageForAdmin) => {
													await messageForAdmin.react('✅');
													await messageForAdmin.react('❌');

													const filter = (reaction, user) =>
														(reaction.emoji.name === '✅' ||
															reaction.emoji.name === '❌') &&
														user.id !== msg.author.id;

													const collector = messageForAdmin.createReactionCollector(
														filter
													);

													collector.on('collect', (reaction, user) => {
														switch (reaction.emoji.name) {
															case '✅':
																messageForAdmin.delete().catch(() => {});
																messageForAdmin.channel.send(
																	'🎉 O usuário foi banido com sucesso! Obrigado pela colaboração 🎉'
																);
																msg.author.send(
																	`🎉 Parabéns sua denúncia ao usuário \`${userMention.user.username}#${userMention.user.discriminator}\` foi aprovada, o usuário já foi banido de nosso discord, por \`${user.username}#${user.discriminator}\`. 🎉`
																);
																msg.author.send(
																	`Agradecemos pela sua colaboração e pedimos que continue a reportar novos possíveis infratores.`
																);
																break;
															case '❌':
																messageForAdmin.channel.send(
																	'🎉 O usuário foi liberado com sucesso! Obrigado pela colaboração 🎉'
																);
																msg.author.send(
																	`❌ Infelizmente sua denúncia ao usuário \`${userMention.user.username}#${userMention.user.discriminator}\` foi desaprovada, caso tenha alguma dúvida entre em contato com \`${user.username}#${user.discriminator}\`. ❌`
																);
																msg.author.send(
																	`Agradecemos pela sua colaboração e pedimos que continue a reportar novos possíveis infratores.`
																);
																messageForAdmin.delete().catch(() => {});
																break;
														}
													});
												});
										}
									});
									return `O usuário ${msg.author.username} delatou o usuário ${userMention.user.username} por descumprir as regras.`;
								} else {
									channel.send(
										'Você não incluiu links de referências para imagens/videos, então sua denúncia foi cancelada por esse motivo.'
									);
									return `O usuário ${m.author.username} não incluiu provas em sua denúncia.`;
								}
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
				}
			} else {
				channel.send(
					`⁉️ Sintaxe incorreta, use dessa forma \`${prefix}denunciar {@user/user_id}\`, após executar o comando iniciará uma sessão de perguntas para a denuncia ser concluída ⁉️`
				);
				return 'O usuário digitou o comando em um sintaxe incorreta.';
			}
		};
	}
}
// $denunciar {user} {motivo}

module.exports = new Denunciar();
