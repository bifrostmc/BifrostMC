import knex from '../database'
import configuration from '../../../configure';

const FLAGS_OPTIONS = [
	'PLAYING',
	'LISTENING',
	'WATCHING',
	'CUSTOM_STATUS',
]

class SetStatus {
	constructor() {
		this.config = {
			name: 'setstatus',
			aliases: [],
			help:
				'Esse comando é utilizado para setar meu status.',
			requiredPermissions: [],
		}
		this.run = async ({ msg, args, prefix, bot }) => {

			if (configuration.comandos.setstatus.usuarios_permitidos.includes(msg.author.id)) {

				if (args.length >= 1 && FLAGS_OPTIONS.includes(args[0])) {

					const messageRequireStatusMessage = await msg.reply('por favor agora digite a mensagem que eu devo colocar em meu status.')

					const filterMessagesForJoinInMyStatus = ({author}) => author.id === msg.author.id;

					const collectorMessage = msg.channel.createMessageCollector(filterMessagesForJoinInMyStatus, {
						time: 1000 * 120,
						max: 1,
					});

					collectorMessage.on('collect', async (messageCollected) => {
						await messageRequireStatusMessage.delete();

						msg.reply(`parabéns! Você setou meu status como »\n\`\`\`yml\n${messageCollected.content}\`\`\``)
						bot.user.setActivity(messageCollected.content, {
							type: args[0]
						})
					})

				} else {
					const messageSyntaxError = await msg.channel.send(`**Erro »** Sintaxe incorreta, por favor digite dessa forma \`${prefix}${this.config.name} {${FLAGS_OPTIONS.join(', ')}}\``)
					await messageSyntaxError.delete({ timeout: 5000 })
				}

			} else {
				const messagePermissionError = await msg.channel.send('**Erro »** Você não tem permissão para executar esse comando.')
				await messagePermissionError.delete({ timeout: 5000 })
			}

		}
	}
}

module.exports = new SetStatus()
