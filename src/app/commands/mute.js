import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import knex from '../database';
import registerUnmutedTimeout from '../utils/registerUnmutedTimeout';
import configuration from '../../../configure';

class Mute {
	constructor() {
		this.config = {
			name: 'mute',
			aliases: ['calar'],
			help:
				'Com esse comando um staffer pode calar um usuário que quebrou nossas diretrizes.',
			requiredPermissions: ['MANAGE_CHANNELS'],
		};
		this.run = async ({ msg, args, prefix, bot }) => {
			if (args.length === 0) {
				msg.channel.send(
					configuration.comandos.mute.syntaxIncorreta
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$AUTHOR', msg.author)
				);
				return 'O usuário não informou as propriedades.';
			}
			const muteMember =
				msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

			if (!muteMember) {
				msg.reply(
					configuration.comandos.mute.naoEncontrado
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$AUTHOR', msg.author)
				);
				return 'O usuário mencionado não encontrado';
			}

			try {
				msg.channel.send(
					configuration.comandos.mute.digiteRazao
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$AUTHOR', msg.author)
				);
				const filterMuted = (m) => m.author.id === msg.author.id;
				const collectorMuted = msg.channel.createMessageCollector(filterMuted, {
					time: 1000 * 120,
					max: 1,
				});

				collectorMuted.on('collect', async (messageMuted) => {
					await knex('muted').where({
						user_muted_id: muteMember.user.id
					}).del()
					
					const muteEmbedNoticie = new MessageEmbed()
						.setColor('RANDOM')
						.setAuthor(muteMember.user.tag, muteMember.user.avatarURL())
						.setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
						.setTitle('Punição aplicada! (Preview)')
						.setDescription(`Razão da punição » \`\`\`yaml\n${messageMuted.content}\`\`\``)
						.addField('\u200B', `**Usuário punido »** ${muteMember}`)
						.addField('\u200B', `**Aplicação feita por »** ${msg.author}`)
						.addField('\u200B', `**Formato da punição »** \`Mute\``)
						.addField(
							'\u200B',
							`**Duração »** \`${
								args.length <= 1
									? 'Permanente'
									: moment()
										.add(args[1], args[2])
										.format('HH:mm:ss - DD/MM/YYYY')
							}\``
						)
						.setTimestamp()
						.setFooter(
							`Copyright © 2020 ${bot.user.username}`,
							bot.user.avatarURL()
						);

					let muterole = msg.guild.roles.cache.find((role) => role.name === "Muted");

					if(!muterole){
						muterole = await msg.guild.roles.create({
						  	data: {
							    name: "Muted",
							    color: 'RANDOM',
						  	}
						})
						msg.guild.channels.cache.filter((channel) => channel.type === "text")
							.forEach((channel) => {
								channel.createOverwrite(muterole, {
									SEND_MESSAGES: false,
									ADD_REACTIONS: false,
								})
							})
					}

					await muteMember.roles.add(muterole.id);
					if (args.length > 1) {
						await knex('muted').insert([
							{
								guild_id: msg.channel.guild.id,
								user_muted_id: muteMember.user.id,
								author_id: msg.author.id,
								due_date: moment().add(args[1], args[2]).valueOf(),
								reason: messageMuted.content,
								is_due_date: args.length > 1,
							},
						]);
						registerUnmutedTimeout(muteMember.user.id);
					}
					const msgMuted = await msg.channel.send(muteEmbedNoticie);
					msgMuted.delete({ timeout: 5000 });
					muteEmbedNoticie.setTitle('Punição aplicada!');
					
					const channelsMutes = await knex('channels').where({
						function: 'muted',
						guild_id: msg.guild.id
					});
					channelsMutes
						.map((channelBanned) => {
							const channelInGuild = msg.guild.channels.cache.get(
								channelBanned.channel_id
							);

							channelInGuild.send(muteEmbedNoticie);

							return channelBanned;
						});
				})
			} catch (error) {
				console.log(error)
				msg.reply(`${error}`);
			}
		};
	}
}

module.exports = new Mute();
