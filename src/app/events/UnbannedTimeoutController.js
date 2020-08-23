import moment from 'moment';

import knex from '../database';

class UnbannedTimeoutController {
	constructor(bot) {
		(async () => {
			try {
				const listBannedsCache = await knex('banned').where({
					is_due_date: true,
				});

				listBannedsCache.map((bannedUser) => {
					const dueDateInMS = moment(Number(bannedUser.due_date));
					const now = moment();
					const diference = moment
						.duration(dueDateInMS.diff(now))
						.asMilliseconds();

					setTimeout(async () => {
						await knex('banned')
							.where({
								id: bannedUser.id,
							})
							.del();

						const guild = bot.guilds.cache.get(bannedUser.guild_id);

						guild.members
							.unban(bannedUser.user_banned_id)
							.then((user) =>
								console.log(`Unbanned ${user.username} from ${guild.name}`)
							)
							.catch(console.error);
					}, diference);
					return bannedUser;
				});
			} catch (error) {
				console.log('Houve um erro ao criar o cache de usuários banidos.');
			}
		})();
	}
}

export default UnbannedTimeoutController;
