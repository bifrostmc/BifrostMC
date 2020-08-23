import moment from 'moment';

import server from '../../server';
import knex from '../database';

export default async function registerUnbannedTimeout(user_banned_id) {
	const userBanned = await knex('banned')
		.where({
			user_banned_id,
		})
		.first();

	const dueDateInMS = moment(Number(userBanned.due_date));
	const now = moment();
	const diference = moment.duration(dueDateInMS.diff(now)).asMilliseconds();

	setTimeout(async () => {
		await knex('banned')
			.where({
				id: userBanned.id,
			})
			.del();

		const guild = server.Bot.bot.guilds.cache.get(userBanned.guild_id);

		guild.members
			.unban(userBanned.user_banned_id)
			.then((user) =>
				console.log(`Unbanned ${user.username} from ${guild.name}`)
			)
			.catch(console.error);
	}, diference);
}
