import checkUserHasPermission from '../utils/checkUserHasPermission';

class MessageController {
	constructor(bot) {
		bot.on('message', async (msg) => {
			const prefix = process.env.PREFIX;
			if (!msg.content.startsWith(prefix)) return;
			if (msg.author.bot) return;
			const args = msg.content.slice(prefix.length).trim().split(' ');
			const cmd = args.shift().toLowerCase();
			const commandFile =
				bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
			let state = true;
			if (commandFile) {
				if (commandFile.config.requiredPermissions) {
					commandFile.config.requiredPermissions.forEach((perm) => {
						if (!checkUserHasPermission(perm, msg.member)) state = false;
					});
				}
				await msg.delete();
				if (!state && msg.member.id !== process.env.OWNER) {
					msg.reply('Você não tem permissão para executar esse comando.');
				} else {
					(async () => {
						const response = await commandFile.run({
							bot,
							msg,
							args,
							prefix,
							cmd,
						});
						console.log(
							`${msg.member.user.username} | ${prefix}${cmd} - ${
								response || 'Sem nenhum retorno assíncrono.'
							}`
						);
					})();
				}
			}
		});
	}
}

export default MessageController;
