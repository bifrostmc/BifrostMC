import { MessageEmbed } from 'discord.js';
import moment from 'moment';

import knex from '../database';
import configuration from '../../../configure';

class Demote {
	constructor() {
		this.config = {
			name: 'demote',
			aliases: ['demotar'],
			help:
				'Com esse comando os administradores pode remover cargos de um membro.',
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
						const oldRoleHighestUser = userMention.roles.highest;

						const embedToChannelLogDemote = new MessageEmbed()
							.setTitle('⬇️ ** Change-log rebaixamento (preview) ** ⬇️')
							.setColor('RANDOM')
							.setDescription(
								// `Registro de alterações, o usuário ${userMention} foi demotado a ${groupMention}.`
								`Clique em 🎉 para confirmar o rebaixamento com anúncio.\nClique em <:check_mark_ok:745344787317784648> para confirmar o rebaixamento silênciosamente.\nClique em <:check_mark_error:745344786856280085> para cancelar o afasatamento.`
							)
							.setThumbnail(bot.user.avatarURL())
							.addFields(
								{
									name: `\u200B`,
									value: `**Cargo retirado » **\`${oldRoleHighestUser.name}\``,
									inline: true,
								},
								{
									name: `**Usuário rebaixado » **\`${userMention.user.tag}\``,
									value: `**Rebaixado por » **\`${msg.author.tag}\``,
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

						const messageDemote = await msg.channel.send(
							embedToChannelLogDemote
						);

						await messageDemote.react('🎉');
						await messageDemote.react('745344787317784648');
						await messageDemote.react('745344786856280085');

						const functionsCollection = {
							'🎉': async () => {
								userMention.roles.remove(groupMention);
								embedToChannelLogDemote
									.setTitle('⬇️ ** Change-log rebaixamento ** ⬇️')
									.setDescription(
										`Registro de alterações, o usuário ${userMention} foi demotado para ${groupMention}.`
									);
								const channelDemote = await knex('channels').where({
									function: 'rebaixamentos',
								});
								channelDemote.map((channalBase) => {
									const channelInGuild = msg.guild.channels.cache.get(
										channalBase.channel_id
									);

									channelInGuild.send(embedToChannelLogDemote);
								});
								embedToChannelLogDemote
									.setTitle(
										'<:alert:745345548424314881> ** Que pena você recebeu um DOWN ** <:alert:745345548424314881>'
									)
									.setDescription(
										`Registro de alterações, você foi demotado para ${groupMention.name}.`
									);
								userMention.user.send(embedToChannelLogDemote);
							},
							'745344787317784648': () => {
								userMention.roles.remove(groupMention);

								embedToChannelLogDemote
									.setTitle(
										'<:alert:745345548424314881> ** Que pena você recebeu um DOWN ** <:alert:745345548424314881>'
									)
									.setDescription(
										`Registro de alterações, você foi demotado a ${groupMention.name}.`
									);
								userMention.user.send(embedToChannelLogDemote);
							},
							'745344786856280085': () => {
								msg.channel
									.send(
										configuration.comandos.demote.demoteCancelado
											.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
											.replace('$USERNAME', msg.member.user.username)
											.replace('$USER_TAG', msg.member.user.discriminator)
									)
									.then((msgCancel) => msgCancel.delete({ timeout: 5000 }));
							},
						};

						const filter = (reaction, user) =>
							!!functionsCollection[reaction.emoji.id || reaction.emoji.name] &&
							user.id === msg.author.id;

						const collector = messageDemote.createReactionCollector(filter);

						collector.on('collect', async (reaction) => {
							const emoji = reaction.emoji.id || reaction.emoji.name;

							messageDemote.delete().catch(() => {});
							await functionsCollection[emoji]();
						});
					} catch (error) {
						console.log(error);
						msg.channel
							.send(
								configuration.comandos.demote.possivelErro
									.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
									.replace('$USERNAME', msg.member.user.username)
									.replace('$USER_TAG', msg.member.user.discriminator)
									.replace('$ERROR_MESSAGE', error.message)
							)
							.then((possibleError) =>
								possibleError.delete({ timeout: 15000 })
							);
						return 'Houve um erro ao se comunicar com o banco de dados.';
					}
				} else {
					msg.channel
						.send(
							configuration.comandos.demote.cargoMenor
								.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
								.replace('$USERNAME', msg.member.user.username)
								.replace('$USER_TAG', msg.member.user.discriminator)
						)
						.then((roleMetion) => roleMetion.delete({ timeout: 15000 }));
					return 'O usuário não pode demotar porque ele tem role menor que a do usuário mencionado.';
				}
			} else {
				msg.channel
					.send(
						configuration.comandos.demote.syntaxIncorreta
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
					)
					.then((syntaxError) => syntaxError.delete({ timeout: 15000 }));
				return 'O usuário digitou o comando em um sintaxe incorreta.';
			}
		};
	}
}

// $promover {menção ou id} {menção de cargo}

module.exports = new Demote();
