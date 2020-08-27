import { MessageEmbed } from 'discord.js';
import configuration from '../../../configure';

class Kick {
	constructor() {
		this.config = {
			name: 'kick',
			aliases: ['kickar'],
			help: `Comando para expulsar um membro do grupo.`,
			requiredPermissions: ['KICK_MEMBERS'],
		};
		this.run = async ({ msg, args, prefix, cmd, bot }) => {
			try {
				if (args.length < 1) {
					msg.channel.send(
						`Você não digitou os argumentos que esse comando recebe por obrigação, profavor siga as instruções abaixo.\nUtilize \`${prefix}${cmd} <@usuário/user_id>\nPor exemplo » \`${prefix}${cmd} ${msg.author.id} 7 days\``
					);
					return 'O usuário não mencionou um membro a ser banido.';
				}

				const memberKicking =
					msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

				if (
					msg.member.roles.highest.rawPosition <=
						memberKicking.roles.highest.rawPosition &&
					msg.guild.ownerID !== msg.author.id
				) {
					msg.channel.send(
						'⁉️ Você não tem permissão para kickar o membro mencionado. ⁉️'
					);
					return 'O usuário não tem permissão para kickar esse membro.';
				}

				const filterReasonKickingCollector = (msgCollected) =>
					msgCollected.author.id === msg.author.id;

				const collectorReasonKicking = msg.channel.createMessageCollector(
					filterReasonKickingCollector,
					{
						time: 1000 * 120,
						max: 1,
					}
				);

				msg.channel.send(
					'<:displaytext:746814240396148757> Porfavor digite uma razão para o membro ser kickado. <:displaytext:746814240396148757>'
				);

				collectorReasonKicking.on(
					'collect',
					async (messageCollectedReasonKick) => {
						try {
							const {
								content: reasonCollectedKick,
							} = messageCollectedReasonKick;

							const embedKickedMessage = new MessageEmbed()
								.setColor('RANDOM')
								.setAuthor(
									memberKicking.user.tag,
									memberKicking.user.avatarURL()
								)
								.setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
								.setTitle('Punição aplicada! (Preview)')
								.addField('\u200B', `**Usuário punido »** ${memberKicking}`)
								.addField('\u200B', `**Aplicação feita por »** ${msg.author}`)
								.addField('\u200B', `**Formato da punição »** \`Kick\``)
								.addField('\u200B', `**Motivo »** ${reasonCollectedKick}`)
								.setFooter(
									`Copyright © 2020 ${bot.user.username}`,
									bot.user.avatarURL()
								);

							await msg.channel.send(embedKickedMessage);
							await memberKicking.kick(reasonCollectedKick);

							bot.cache_control.channels
								.filter(
									(channelFiltering) => channelFiltering.function === 'kicked'
								)
								.map(async (channelPunished) => {
									const channelInGuildPunished = msg.guild.channels.cache.get(
										channelPunished.channel_id
									);
									if (channelInGuildPunished.guild !== msg.guild)
										return channelInGuildPunished;

									embedKickedMessage.setTitle('Punição aplicada!');

									await channelInGuildPunished.send(embedKickedMessage);

									return channelPunished;
								});

							return 'O usuário foi kicado com sucesso!';
						} catch (error) {
							console.log(error);
							msg.channel.send(
								configuration.comandos.lock.possivelErro
									.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
									.replace('$USERNAME', msg.member.user.username)
									.replace('$USER_TAG', msg.member.user.discriminator)
									.replace('$ERROR_MESSAGE', error.message)
							);
							return 'Houve um erro ao efetuar o comando.';
						}
					}
				);
			} catch (error) {
				console.log(error);
				msg.channel.send(
					configuration.comandos.lock.possivelErro
						.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$ERROR_MESSAGE', error.message)
				);
				return 'Houve um erro ao efetuar o comando.';
			}
		};
	}
}

module.exports = new Kick();
