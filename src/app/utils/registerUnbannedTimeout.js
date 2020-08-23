import { MessageEmbed } from 'discord.js';

import moment from 'moment';

import CacheController from '../events/CacheController';
import server from '../../server';
import knex from '../database';

export default async function registerUnbannedTimeout(user_banned_id) {
	const { bot } = server.Bot;
	const bannedUser = await knex('banned')
		.where({
			user_banned_id,
		})
		.first();

	const dueDateInMS = moment(Number(bannedUser.due_date));
	const now = moment();
	const diference = moment.duration(dueDateInMS.diff(now)).asMilliseconds();

	setTimeout(async () => {
		try {
			const guild = server.Bot.bot.guilds.cache.get(bannedUser.guild_id);

			const userBanned = await guild.fetchBan(bannedUser.user_banned_id);

			const userAuthor = await bot.users.fetch(bannedUser.author_id);
			const userBannedFetched = await bot.users.fetch(
				bannedUser.user_banned_id
			);

			await guild.members.unban(bannedUser.user_banned_id);

			await knex('banned')
				.where({
					id: bannedUser.id,
				})
				.del();
			CacheController.updateCache(bot, 'banned');

			const banEmbedNoticie = new MessageEmbed()
				.setAuthor(userBannedFetched.tag, userBannedFetched.avatarURL())
				.setThumbnail(guild.iconURL() || bot.user.avatarURL())
				.setTitle('Punição anulada!')
				.addField(
					'\u200B',
					`**Usuário desbanido »** \`${userBannedFetched.tag}\``
				)
				.addField('\u200B', `**Aplicação feita por »** \`${userAuthor.tag}\``)
				.addField('\u200B', `**Formato da punição »** \`${userBanned.reason}\``)
				.addField('\u200B', `**Motivo »** Prazo da punição acabado`)
				.setTimestamp()
				.setFooter(
					`Copyright © 2020 ${bot.user.username}`,
					bot.user.avatarURL()
				);

			bot.cache_control.channels
				.filter((channelFiltering) => channelFiltering.function === 'banned')
				.map((channelBanned) => {
					const channelInGuild = guild.channels.cache.get(
						channelBanned.channel_id
					);

					return channelInGuild.send(banEmbedNoticie);
				});
		} catch (error) {
			console.log(error);
		}
	}, diference);
}
