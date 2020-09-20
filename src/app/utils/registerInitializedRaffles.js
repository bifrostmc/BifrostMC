import registerRaffleTimeoutAndReactions from './registerRaffleTimeoutAndReactions';

class RegisterInitializedRaffles {
	constructor(bot) {
		bot.cache_control.raffles.forEach(async ({ message_id, channel_id }) => {
			const raffle = bot.cache_control.raffles.get(message_id);
			const channel = await bot.channels.fetch(channel_id);
			if (!channel) return;
			const message = await channel.messages.fetch(message_id);
			if (!message) return;

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
