import { MessageEmbed } from 'discord.js';
import configuration from '../../../configure';

class Help {
	constructor() {
		this.config = {
			name: 'help',
			aliases: ['ajuda', '?', 'h', 'a'],
			help:
				'Esse comando serve para ajudar o jogador que estiver com dúvidas em comandos',
			requiredPermissions: [],
		};

		this.run = ({ msg, bot, args, prefix }) => {
			const responseMessage = new MessageEmbed().setColor(`RANDOM`);

			if (args[0]) {
				const command =
					bot.commands.get(args[0]) ||
					bot.commands.get(bot.aliases.get(args[0]));

				if (!command) {
					msg.reply(
						configuration.comandos.help.comandoInvalido
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
					);
					return 'O usuário digitou um comando inválido no help.';
				}

				const aliases = command.config.aliases.join(', ');
				responseMessage
					.setTitle(
						configuration.comandos.help.embeds.comandoEspecifico.title
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$COMANDO_MENCIONADO', args[0])
					)
					.setDescription(
						configuration.comandos.help.embeds.comandoEspecifico.description
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$COMANDO_MENCIONADO', args[0])
							.replace('$MESSAGE_HELP_COMMAND', command.config.help)
					)
					.addField('**`Aliases »`**', '**`Permissões requeridas »`**', true)
					.addField(
						`[${aliases}]`,
						command.config.requiredPermissions.join(', ') ||
							'**Livre para todos**',
						true
					)
					.addField('\u200B', '\u200B');
			} else {
				responseMessage
					.setTitle(
						configuration.comandos.help.embeds.todosComandos.title
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$COMANDO_MENCIONADO', args[0])
					)
					.setDescription(
						configuration.comandos.help.embeds.todosComandos.description
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$COMANDO_MENCIONADO', args[0])
					)
					.addField('\u200B', '\u200B');
				bot.commands.map((command) => {
					responseMessage.addField(
						prefix + command.config.name,
						command.config.help,
						true
					);
					return command;
				});
				responseMessage.addField('\u200B', '\u200B');
			}

			responseMessage
				.setTimestamp()
				.setFooter(
					`Copyright © 2020 ${bot.user.username}`,
					bot.user.avatarURL()
				);
			msg.channel.send(responseMessage);
			return 'O usuário recebeu um help de comandos.';
		};
	}
}

module.exports = new Help();
