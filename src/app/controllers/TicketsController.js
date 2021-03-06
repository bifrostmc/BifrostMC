const knex = require('../database/');

class TicketController {
	constructor() {
		this.index = (req) => {
			return new Promise((res, rej) => {
				const { user_id } = req.body;

				knex('tickets').where({ user_id }).limit(1).first()
					.then((response) => {
						res(response);
					})
					.catch((err) => {
						rej(err);
					});
			});
		};

		this.store = (req) => {
			return new Promise((res, rej) => {
				const { msg } = req.body;
				const positions = [];
				msg.guild.members.cache.map((user) => {
					if (user.hasPermission('MANAGE_MESSAGES')) {
						return positions.push({
							id: user.user.id,
							allow: ['VIEW_CHANNEL'],
						});
					}
					return false;
				});
				msg.guild.channels
					.create(`ticket-${msg.author.id}`, {
						type: 'text',
						reason: 'New channel added for fun!',
						permissionOverwrites: [
							...positions,
							{
								id: msg.guild.id,
								deny: ['VIEW_CHANNEL'],
							},
							{
								id: msg.member.id,
								allow: ['VIEW_CHANNEL'],
							},
						],
					})
					.then((channel) => {
						knex('tickets').insert([{
							user_id: msg.author.id,
							name_channel: `ticket-${msg.author.id}`,
							channel_id: channel.id,
							guild_id: channel.guild.id
						}])
							.then(() => {
								return res(
									`Seu ticket foi criado clique aqui para acessa-lo: ${channel}`
								);
							})
							.catch(() => {
								channel.delete().catch(() => {});
								return rej(
									new Error(
										'Houve um erro na requisição de criação de um ticket, tente novamente mais tarde.'
									)
								);
							});
					})
					.catch(() => {
						rej(
							new Error(
								'Houve um erro na requisição de criação de um ticket, tente novamente mais tarde.'
							)
						);
					});
			});
		};

		this.delete = (req) => {
			return new Promise(async (res, rej) => {
				const { user_id, bot, member, author_member } = req.body;
				const sucess = (author_member.user.id === member.user.id)
					? 'o seu ticket foi deletado com sucesso!'
					: `O ticket de ${member} foi deletado com sucesso!`;

				const ticket = await knex('tickets').where({ user_id }).limit(1).first();
				if (!ticket) return res(
					(author_member.user.id === member.user.id)
						? 'você não possuí um ticket registrado em nosso sistema.'
						: `o usuário \`${member.user.username}#${member.user.discriminator}\` não possui um ticket.`
				);

				this.eliminate(user_id, bot, ticket).then((response) => {
					console.log(response)
					if (!response)
						return rej(
							(author_member.user.id === member.user.id)
							? 'não foi possível deletar o seu ticket por um erro desconhecido.'
							: `Não foi possível deletar o ticket de \`${member.user.username}#${member.user.discriminator}\`.`
						);

					return res(sucess);
				});
			});
		};
	}

	async eliminate(user_id, bot, data) {
		try {
			await knex('tickets').where({ user_id }).del();

			const canal = await bot.channels.fetch(data.channel_id);
			canal.delete();
			return true;
		} catch (err) {
			console.log(err)
			return false;
		}
	}
}

module.exports = new TicketController();