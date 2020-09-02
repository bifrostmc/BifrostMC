const Discord = require('discord.js');
const TicketsController = require('../controllers/TicketsController');
const knex = require('../database');

class Ticket {
	constructor() {
		this.config = {
			name: 'ticket',
			aliases: [],
			help: 'Esse comando gerencia o meu sistema de tickets.',
			requiredPermissions: [],
		};

		this.run = ({bot, msg, args, prefix}) => {
			if (args.length < 0 || !this.functions[args[0]]) {
				msg.channel.send(
					`⁉️ Porfavor informe um argumento válido, para saber os argumentos utilize, \`${prefix}${this.config.name} lista\` ⁉️`
					)
				return 'Não foi informado a args 1';
			}
			const func = this.functions[args[0]];
			func(bot, msg, args, prefix);
			return true;
		};

		this.functions = {
			lista: async (bot, msg, args, prefix) => {
				const embed = new Discord.MessageEmbed()
				.setTitle('**Sub comandos do comando ticket**')
				.setAuthor(`${msg.author.username} tickets`, msg.author.avatarURL())
				.setColor('#222222')
				.setDescription(`Esses sãos os sub-comandos disponíveis para o gerenciamento de tickets »`)
				.addField(
					`**${prefix}ticket criar**`,
					'```yaml\nEsse sub-comando serve para você abrir um ticket.```'
					)
				.addField(
					`**${prefix}ticket deletar**`,
					'```yaml\nEsse sub-comando serve para deletar um ticket que você abriu anteriormente.```'
					)
				.addField(
					`**${prefix}ticket lista**`,
					'```yaml\nEsse sub-comando serve para var a lista de sub-comandos.```'
				)
				.setTimestamp()
				.setFooter(`Copyright © 2020 ${bot.user.username}`, bot.user.avatarURL());
				msg.channel.send(embed);
			},
			criar: async (bot, msg, args, prefix) => {
				if (await knex('tickets').where({ user_id: msg.author.id }).limit(1).first())
					return msg.reply(
						`Você já tem um ticket solicitado espere até um staffer fechar ou feche você mesmo usando \`${
							prefix + this.config.name
						} deletar\`.`
						);

				const date = new Date();
				TicketsController.store({
					body: {
						msg,
					},
				})
				.then((result) => {
					msg.reply(result);
				})
				.catch((err) => {
					msg.reply(err);
				});
				return true;
			},
			deletar: async (bot, msg, args) => {
				let deleted = msg.member;
				if (args[1]) {
					if (!msg.member.hasPermission('MANAGE_MESSAGES'))
						return msg.reply(
							`Você não tem permissão para excluir tickets de outros usuários.`
							);
					deleted =
					msg.mentions.members.first() || msg.guild.members.get(args[1]);
				}
				try {
					const ticket = await TicketsController.delete({
						body: {
							user_id: deleted.user.id,
							bot,
							user: deleted,
						},
					});
					msg.reply(ticket);
				} catch (err) {
					msg.reply(err);
				}

				return null;
			},
		};
	}
}

module.exports = new Ticket();