import moment from 'moment'

import checkUserHasPermission from '../utils/checkUserHasPermission';

import knex from '../database';

class MessageController {
	constructor(bot) {
		bot.on('presenceUpdate', async (oldPresence, newPresence) => {
			if (newPresence.user.bot) return;
			const { member, user } = newPresence;

			const presence = await knex('presences').where({
				user_id: newPresence.userID
			}).limit(1).first()

			if (!presence) {
				await knex('presences').insert([
					{
						user_id: newPresence.userID,
						status: newPresence.status,
					},
				]);
			}
			let status = (!oldPresence) ? 'offline' : oldPresence.status;

			if ((moment() - moment(presence.updated_at)) >= 300000
				&& presence.status.toLowerCase() === "offline"
				&& status.toLowerCase() === "offline") {
				try {
					const banEmbedNoticie = new MessageEmbed()
						.setAuthor(user.tag, user.avatarURL())
						.setThumbnail(guild.iconURL() || bot.user.avatarURL())
						.setTitle('Punição aplicado!')
						.addField(
							'\u200B',
							`**Usuário banido »** \`${user.tag}\``
						)
						.addField(
							'\u200B',
							`**Aplicação feita por »** \`${bot.user.tag}\``
						)
						.addField(
							'\u200B',
							`**Formato da punição »** \`Ban\``
						)
						.addField('\u200B', `**Motivo »** Usuário inatívo por 7 dias seguintes.`)
						.setTimestamp()
						.setFooter(
							`Copyright © 2020 ${bot.user.username}`,
							bot.user.avatarURL()
						);

					await member.ban({
						reason: 'Usuário inativo por 7 dias.'
					})

					const channelsPresences = await knex('channels').where({
						function: 'presence',
						guild_id: member.guild.id
					});

					channelsPresences.forEach((channelPresence) => {
						const channelPresenceGuild = msg.guild.channels.cache.get(
							channelBanned.channel_id
						);

						channelPresenceGuild.send(banEmbedNoticie)
					})
				} catch (error) {
					console.log(error)
				}
			} else {
				await knex('presences').update({
					status: newPresence.status
				}).where({
					user_id: newPresence.userID,
				})
			}
		});
	}
}

export default MessageController;
