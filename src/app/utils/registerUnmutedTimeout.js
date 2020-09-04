import { MessageEmbed } from 'discord.js';

import moment from 'moment';

import CacheController from '../events/CacheController';
import server from '../../server';
import knex from '../database';

export default async function registerUnmutedTimeout(user_muted_id) {
	const { bot } = server.Bot;
	const mutedUser = await knex('muted')
		.where({
			user_muted_id,
		})
		.first();

	const dueDateInMS = moment(Number(mutedUser.due_date));
	const now = moment();
	const diference = moment.duration(dueDateInMS.diff(now)).asMilliseconds();

	setTimeout(async () => {
		try {
			const guild = server.Bot.bot.guilds.cache.get(mutedUser.guild_id);

			const userBanned = await guild.fetchBan(mutedUser.user_muted_id);

			const userAuthor = await bot.users.fetch(mutedUser.author_id);
			const userBannedFetched = await bot.users.fetch(
				mutedUser.user_muted_id
			);

			await guild.members.unban(mutedUser.user_muted_id);

			await knex('muted')
				.where({
					id: mutedUser.id,
				})
				.del();
			CacheController.updateCache(bot, 'muted');

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
				.filter((channelFiltering) => channelFiltering.function === 'muted')
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
