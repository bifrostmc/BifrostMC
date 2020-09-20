class Say {
	constructor() {
		this.config = {
			name: 'say',
			aliases: [],
			help:
				'Com esse comando um staffer pode falar por mim.',
			requiredPermissions: ['MANAGE_MESSAGES'],
		};
		this.run = async ({ msg, args, prefix, bot }) => {

			const requireMessage = await msg.reply('por favor agora digite a mensagem que você deseja que eu re-envio.')

			const filterRequiringMessage = ({author}) => author.id === msg.author.id

			const collectorMessageContentForReply = msg.channel.createMessageCollector(filterRequiringMessage, {
				time: 1000 * 120,
				max: 1,
			})

			collectorMessageContentForReply.on('collect', async (messageCollected) => {
				await requireMessage.delete()

				await msg.channel.send(messageCollected.content)
			})
		}
	}
}

module.exports = new Say();
