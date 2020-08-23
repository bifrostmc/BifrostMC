import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import knex from '../database';
import registerUnbannedTimeout from '../utils/registerUnbannedTimeout';

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
					`Utilize \`${prefix}ban <@usuário/user_id> {tempo} {data_type = [days, months, years]}\`! Caso queira uma punição permanente apenas não informe o tempo a ser banido\nPor exemplo » ${prefix}ban ${msg.author} 7 days`
				);
				return 'O usuário não informou as propriedades.';
			}
			const banMember =
				msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

			if (!banMember) {
				msg.reply('Não foi possível encontrar este usuário!');
				return 'O usuário mencionado não encontrado';
			}

			msg.channel.send(
				'<:displaytext:746814240396148757> Digite uma razão para o usuário ser banido <:displaytext:746814240396148757>'
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

					await knex('banned').insert([
						{
							guild_id: msg.channel.guild.id,
							user_banned_id: banMember.user.id,
							author_id: msg.author.id,
							due_date: moment().add(args[1], args[2]).valueOf(),
							is_due_date: args.length > 1,
						},
					]);

					await banMember.ban({ reason: banReason.content });
					if (args.length > 1) {
						registerUnbannedTimeout(banMember.user.id);
					}
					await msg.channel.send(banEmbedNoticie);
				} catch (error) {
					msg.reply(`${error}`);
				}
			});
		};
	}
}

module.exports = new Ban();
