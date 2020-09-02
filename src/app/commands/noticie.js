class Noticie {
	constructor() {
		this.config = {
			name: 'noticie',
			aliases: ['anunciar'],
			help:
				'Com esse comando um admnistrador pode enviar uma mensagem de aviso a todos membros do servidor.',
			requiredPermissions: ['MANAGE_MESSAGES'],
		};

		this.run = async ({ msg, bot }) => {
			msg.channel.send(
				`❗ ${msg.author}, porfavor digite uma mensagem a ser anúnciada (5 minutos) (*) ❗\n\nDigite \`cancelar\` para sair da sessão de sugestão.`
			);

			const filterNoticie = (m) => m.author.id === msg.author.id;
			const collectorNoticie = msg.channel.createMessageCollector(
				filterNoticie,
				{
					time: 300000,
					max: 1,
				}
			);

			collectorNoticie.on('collect', async (messageNoticie) => {
				messageNoticie.delete().catch(() => {});
				if (messageNoticie.content.toLowerCase() === 'cancelar') {
					msg.channel
						.send(
							'<:check_error:745344787087098008> Você saiu da sessão de sugestão com sucesso, você pode abrir outra a qualquer momento. <:check_error:745344787087098008>'
						)
						.then((leaveMessage) => leaveMessage.delete({ timeout: 5000 }));
				}

				await msg.guild.members.cache.map(async (member) => {
					if (member.id === bot.user.id || member.user.bot) return 0;
					try {
						await member.send(
							`📣 ${member}. Olá, venho em seu privado para anunciar um recado que nossa equipe tem a fazer, admnistrador que efetuou esse anúncio ${msg.author.tag} 📣`
						);
						await member.send(`\`\`\`yaml\n${messageNoticie.content}\`\`\``);
						return 1;
					} catch (error) {
						console.log(error);
						return 0;
					}
				});

				msg.channel.send(`🎉 ${msg.author}. Você anunciou com sucesso!  🎉`);
			});
		};
	}
}

module.exports = new Noticie();
