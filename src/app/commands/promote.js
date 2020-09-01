import { MessageEmbed } from 'discord.js';
import moment from 'moment';

import knex from '../database';
import configuration from '../../../configure';

class Promote {
	constructor() {
		this.config = {
			name: 'promote',
			aliases: ['promover'],
			help:
				'Com esse comando os administradores pode adicionar cargos a um membro.',
			requiredPermissions: ['MANAGE_ROLES'],
		};
		this.run = async ({ msg, args, prefix, bot }) => {
			if (
				args.length >= 2 &&
				(msg.mentions.members.first() ||
					msg.guild.members.cache.get(args[0])) &&
				(msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]))
			) {
				const userMention =
					msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
				const groupMention =
					msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);

				if (msg.member.roles.highest.rawPosition > groupMention.rawPosition) {
					try {
						const embedToChannelLogPromote = new MessageEmbed()
							.setTitle('⬆️ ** Change-log Promoção (preview) ** ⬆️')
							.setColor('RANDOM')
							.setDescription(
								// `Registro de alterações, o usuário ${userMention} foi promovido a ${groupMention}.`
								`Clique em 🎉 para confirmar a promoção com anúncio.\nClique em <:check_mark_ok:745344787317784648> para confirmar a promoção silênciosamente.\nClique em <:check_mark_error:745344786856280085> para cancelar a promoção.`
							)
							.setThumbnail(bot.user.avatarURL())
							.addFields(
								{
									name: `\u200B`,
									value: `**Cargo antigo » **\`${userMention.roles.highest.name}\``,
									inline: true,
								},
								{
									name: `\u200B`,
									value: `**Cargo atual » **\`${groupMention.name}\``,
									inline: true,
								},
								{
									name: `**Usuário promovido » **\`${userMention.user.tag}\``,
									value: `**Promovido por » **\`${msg.author.tag}\``,
									inline: false,
								},
								{
									name: `**Modificado em » ** \`${moment().format(
										'DD/MM/YYYY, h:mm:ss a'
									)}\``,
									value: '\u200B',
								}
							)
							.setTimestamp()
							.setFooter(
								`Copyright © 2020 ${bot.user.username}`,
								bot.user.avatarURL()
							);

						const messagePromote = await msg.channel.send(
							embedToChannelLogPromote
						);

						await messagePromote.react('🎉');
						await messagePromote.react('745344787317784648');
						await messagePromote.react('745344786856280085');

						const functionsCollection = {
							'🎉': async () => {
								userMention.roles.add(groupMention);
								embedToChannelLogPromote
									.setTitle('⬆️ ** Change-log Promoção ** ⬆️')
									.setDescription(
										`Registro de alterações, o usuário ${userMention} foi promovido a ${groupMention}.`
									);
								const channelPromote = await knex('channels').where({
									function: 'promocoes',
								});
								channelPromote.map((channalBase) => {
									const channelInGuild = msg.guild.channels.cache.get(
										channalBase.channel_id
									);

									channelInGuild.send(embedToChannelLogPromote);
								});
								embedToChannelLogPromote
									.setTitle('🎉 ** Parabéns você recebeu um UP ** 🎉')
									.setDescription(
										`Registro de alterações, você foi promovido a ${groupMention.name}.`
									);
								userMention.user.send(embedToChannelLogPromote);
							},
							'745344787317784648': () => {
								userMention.roles.add(groupMention);

								embedToChannelLogPromote
									.setTitle('🎉 ** Parabéns você recebeu um UP ** 🎉')
									.setDescription(
										`Registro de alterações, você foi promovido a ${groupMention.name}.`
									);
								userMention.user.send(embedToChannelLogPromote);
							},
							'745344786856280085': () => {
								msg.channel
									.send(
										configuration.comandos.promote.promoteCancelado
											.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
											.replace('$USERNAME', msg.member.user.username)
											.replace('$USER_TAG', msg.member.user.discriminator)
									)
									.then((promoteCancelled) =>
										promoteCancelled.delete({ timeout: 5000 })
									);
							},
						};

						const filter = (reaction, user) =>
							!!functionsCollection[reaction.emoji.id || reaction.emoji.name] &&
							user.id === msg.author.id;

						const collector = messagePromote.createReactionCollector(filter);

						collector.on('collect', async (reaction) => {
							const emoji = reaction.emoji.id || reaction.emoji.name;

							messagePromote.delete().catch(() => {});
							await functionsCollection[emoji]();
						});
					} catch (error) {
						console.log(error);
						msg.channel
							.send(
								configuration.comandos.promote.possivelErro
									.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
									.replace('$USERNAME', msg.member.user.username)
									.replace('$USER_TAG', msg.member.user.discriminator)
									.replace('$ERROR_MESSAGE', error.message)
							)
							.then((msgForDetectedCommunicationInServices) =>
								msgForDetectedCommunicationInServices.delete({ timeout: 15000 })
							);
						return 'Houve um erro ao se comunicar com o banco de dados.';
					}
				} else {
					msg.channel
						.send(
							configuration.comandos.promote.cargoMenor
								.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
								.replace('$USERNAME', msg.member.user.username)
								.replace('$USER_TAG', msg.member.user.discriminator)
						)
						.then((msgForWarningThisUserLowRole) =>
							msgForWarningThisUserLowRole.delete({ timeout: 15000 })
						);
					return 'O usuário não pode promover porque ele tem role menor que a do usuário mencionado.';
				}
			} else {
				msg.channel
					.send(
						configuration.comandos.promote.syntaxIncorreta
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
					)
					.then((messageErrorDetected) =>
						messageErrorDetected.delete({ timeout: 15000 })
					);
				return 'O usuário digitou o comando em um sintaxe incorreta.';
			}
		};
	}
}

// $promover {menção ou id} {menção de cargo}

module.exports = new Promote();
