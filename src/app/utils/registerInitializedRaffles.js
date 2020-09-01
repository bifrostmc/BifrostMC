import registerRaffleTimeoutAndReactions from './registerRaffleTimeoutAndReactions';

class RegisterInitializedRaffles {
	constructor(bot) {
		bot.cache_control.raffles.forEach(async ({ message_id, channel_id }) => {
			const raffle = bot.cache_control.raffles.get(message_id);
			const channel = bot.channels.cache.get(channel_id);
			const message = await channel.messages.fetch(message_id);

			registerRaffleTimeoutAndReactions(
				raffle,
				channel.guild,
				channel,
				message
			);
		});
	}
}

export default RegisterInitializedRaffles;
