import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import knex from '../database';
import configuration from '../../../configure';
import registerRaffleTimeoutAndReactions from '../utils/registerRaffleTimeoutAndReactions';

class Raffle {
	constructor() {
		this.config = {
			name: 'raffle',
			aliases: ['sortear'],
			help:
				'Sortear um membro entre todos membros do servidor que está online/offline/todos .',
			requiredPermissions: ['MANAGE_GUILD'],
		};
		this.run = async ({ msg, args, bot }) => {
			if (args.length <= 1) {
				msg.channel
					.send(
						configuration.comandos.raffle.syntaxIncorreta
							.replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
							.replace('$USERNAME', msg.member.user.username)
							.replace('$USER_TAG', msg.member.user.discriminator)
					)
					.then((messageErrorDetected) =>
						messageErrorDetected.delete({ timeout: 15000 })
					);
				return 'O usuário digitou o comando em um sintaxe incorreta.';
			}

			await msg.channel.send(
				'<:displaytext:746814240396148757> Digite a descrição do sorteio » <:displaytext:746814240396148757>'
			);

			const filterReasonIsRaffleCollector = (msgCollected) =>
				msgCollected.author.id === msg.author.id;

			const collectorReasonIsRaffle = msg.channel.createMessageCollector(
				filterReasonIsRaffleCollector,
				{
					time: 1000 * 120,
					max: 1,
				}
			);

			collectorReasonIsRaffle.on(
				'collect',
				async (messageCollectedReasonIsRaffle) => {
					try {
						const embedAdvertisement = new MessageEmbed()
							.setColor('RANDOM')
							.setAuthor(msg.member.user.tag, msg.member.user.avatarURL())
							.setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
							.setTitle('Sorteio iniciado! (Preview)')
							.setDescription(
								`**Descrição »** \`\`\`yaml\n${messageCollectedReasonIsRaffle.content}\`\`\``
							)
							.addField('\u200B', `**Quantidade de membros participando »** 0`)
							.addField('\u200B', `**Sorteio iniciado por »** ${msg.author}`)
							.addField(
								'\u200B',
								`**Duração »** \`${moment()
									.add(args[0], args[1])
									.format('HH:mm:ss - DD/MM/YYYY')}\``
							)
							.setTimestamp()
							.setFooter(
								`Copyright © 2020 ${bot.user.username}`,
								bot.user.avatarURL()
							);

						await msg.channel.send(embedAdvertisement);

						bot.cache_control.channels
							.filter(
								(channelFiltering) => channelFiltering.function === 'raffle'
							)
							.forEach(async (channelRaffle) => {
								const channelInGuild = msg.guild.channels.cache.get(
									channelRaffle.channel_id
								);

								embedAdvertisement.setTitle('Sorteio iniciado!');
								const advertisement = await channelInGuild.send(
									embedAdvertisement
								);

								await advertisement.react('🎉');

								await knex('raffles').insert([
									{
										guild_id: msg.channel.guild.id,
										channel_id: channelRaffle.channel_id,
										message_id: advertisement.id,
										author_id: msg.author.id,
										description: messageCollectedReasonIsRaffle.content,
										due_date: moment().add(args[0], args[1]).valueOf(),
									},
								]);
								const raffle = {
									guild_id: msg.channel.guild.id,
									channel_id: channelRaffle.channel_id,
									message_id: advertisement.id,
									author_id: msg.author.id,
									description: messageCollectedReasonIsRaffle.content,
									due_date: moment().add(args[0], args[1]).valueOf(),
								};
								registerRaffleTimeoutAndReactions(
									raffle,
									channelInGuild.guild,
									channelInGuild,
									advertisement
								);
							});
					} catch (error) {
						console.log(error);
						msg.channel.send('Houve um erro ao registrart o giveaways.');
					}
				}
			);

			return 'Comando foi finalizado com sucesso!';
		};
	}
}

module.exports = new Raffle();
