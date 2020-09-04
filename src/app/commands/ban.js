import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import knex from '../database';
import registerUnbannedTimeout from '../utils/registerUnbannedTimeout';
import configuration from '../../../configure';

class Ban {
	constructor() {
		this.config = {
			name: 'ban',
			aliases: ['banir'],
			help:
				'Com esse comando um staffer pode banir um usuário que quebrou nossas diretrizes.',
			requiredPermissions: ['BAN_MEMBERS'],
		};
		this.run = async ({ msg, args, prefix, bot }) => {
			if (args.length === 0) {
				msg.channel.send(
					configuration.comandos.ban.syntaxIncorreta
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$AUTHOR', msg.author)
				);
				return 'O usuário não informou as propriedades.';
			}
			const banMember =
				msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

			if (!banMember) {
				msg.reply(
					configuration.comandos.ban.naoEncontrado
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$AUTHOR', msg.author)
				);
				return 'O usuário mencionado não encontrado';
			}

			msg.channel.send(
				configuration.comandos.ban.digiteRazao
					.replace('$USERNAME', msg.member.user.username)
					.replace('$USER_TAG', msg.member.user.discriminator)
					.replace('$AUTHOR', msg.author)
			);

			const filterBanned = (m) => m.author.id === msg.author.id;
			const collectorBanned = msg.channel.createMessageCollector(filterBanned, {
				time: 1000 * 120,
				max: 1,
			});

			collectorBanned.on('collect', async (messageBanned) => {
				const banReason = messageBanned;

				try {
					const banEmbedNoticie = new MessageEmbed()
						.setColor('RANDOM')
						.setAuthor(banMember.user.tag, banMember.user.avatarURL())
						.setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
						.setTitle('Punição aplicada! (Preview)')
						.addField('\u200B', `**Usuário punido »** ${banMember}`)
						.addField('\u200B', `**Aplicação feita por »** ${msg.author}`)
						.addField('\u200B', `**Formato da punição »** \`Ban\``)
						.addField('\u200B', `**Motivo »** ${banReason}`)
						.addField(
							'\u200B',
							`**Duração »** \`${
								args.length <= 1
									? 'Permanente'
									: moment()
											.add(args[1], args[2])
											.format('HH:mm:ss - DD/MM/YYYY')
							}\``
						)
						.setTimestamp()
						.setFooter(
							`Copyright © 2020 ${bot.user.username}`,
							bot.user.avatarURL()
						);

					await banMember.ban({ reason: banReason.content });
					if (args.length > 1) {
						await knex('banned').insert([
							{
								guild_id: msg.channel.guild.id,
								user_banned_id: banMember.user.id,
								author_id: msg.author.id,
								due_date: moment().add(args[1], args[2]).valueOf(),
								is_due_date: args.length > 1,
							},
						]);
						registerUnbannedTimeout(banMember.user.id);
					}
					const msgBanned = await msg.channel.send(banEmbedNoticie);
					msgBanned.delete({ timeout: 5000 });

					banEmbedNoticie.setTitle('Punição aplicada!');

					if (bot.cache_control.channels) {
						console.log(bot.cache_control.channels)
						const channelsBans = await knex('channels').where({
							function: 'banned',
							guild_id: msg.guild.id
						});
						channelsBans
							.map((channelBanned) => {
								const channelInGuild = msg.guild.channels.cache.get(
									channelBanned.channel_id
								);

								channelInGuild.send(banEmbedNoticie);

								return channelBanned;
							});
					}
				} catch (error) {
					msg.reply(`${error}`);
				}
			});
		};
	}
}

module.exports = new Ban();
