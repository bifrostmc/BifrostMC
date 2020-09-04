import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import knex from '../database';
import registerUnmutedTimeout from '../utils/registerUnmutedTimeout';
import configuration from '../../../configure';

class UnMute {
	constructor() {
		this.config = {
			name: 'unmute',
			aliases: ['descalar'],
			help:
				'Com esse comando um staffer pode descalar um usuário que quebrou nossas diretrizes.',
			requiredPermissions: ['MANAGE_CHANNELS'],
		};
		this.run = async ({ msg, args, prefix, bot }) => {
			if (args.length === 0) {
				msg.channel.send(
					configuration.comandos.unmute.syntaxIncorreta
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
					configuration.comandos.unmute.naoEncontrado
						.replace('$USERNAME', msg.member.user.username)
						.replace('$USER_TAG', msg.member.user.discriminator)
						.replace('$AUTHOR', msg.author)
				);
				return 'O usuário mencionado não encontrado';
			}

			try {
				const muteEmbedNoticie = new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor(muteMember.user.tag, muteMember.user.avatarURL())
					.setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
					.setTitle('Punição anulada! (Preview)')
					.addField('\u200B', `**Usuário desmutado »** ${muteMember}`)
					.addField('\u200B', `**Aplicação feita por »** ${msg.author}`)
					.addField('\u200B', `**Formato da punição »** \`Mute\``)
					.setTimestamp()
					.setFooter(
						`Copyright © 2020 ${bot.user.username}`,
						bot.user.avatarURL()
					);

				let muterole = msg.guild.roles.cache.find((role) => role.name === 'Muted');

				if (!muterole) {
					await msg.channel.send('Não existe cargo `Muted` nesse servidor, ou seja não mutei ninguém até esse momento')
					return 'Não existe cargo `Muted` nesse servidor, ou seja não mutei ninguém até esse momento';
				}
				
				await muteMember.roles.remove(muterole)

				const msgMuted = await msg.channel.send(muteEmbedNoticie);
				msgMuted.delete({ timeout: 5000 });
				muteEmbedNoticie.setTitle('Punição anulada!');
				if (bot.cache_control.channels) {
					const channelsBans = await knex('channels').where({
						function: 'muted',
						guild_id: msg.guild.id
					});
					channelsBans
						.map((channelBanned) => {
							const channelInGuild = msg.guild.channels.cache.get(
								channelBanned.channel_id
							);

							channelInGuild.send(muteEmbedNoticie);

							return channelBanned;
						});
				}
			} catch (error) {
				msg.reply(`${error}`);
			}
		};
	}
}

module.exports = new UnMute();
