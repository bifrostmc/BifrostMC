import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import configuration from '../../../configure';

class ServerInfo {
  constructor() {
    this.config = {
      name: 'serverinfo',
      aliases: [],
      help: 'Com esse comando você pode ver as informações do servidor.',
      requiredPermissions: [],
    };

    this.run = async ({ msg, bot, args }) => {
      const roles = msg.guild.roles.cache.mapValues((role) => role.name);

      try {
        let userInfosEmbed = new MessageEmbed()
          .setColor('RANDOM')
          .setTitle(`📃 ** Informações do servidor ** 📃`)
          .setAuthor(
            `${msg.guild.name} infos`,
            msg.guild.iconURL() || bot.user.avatarURL()
          )
          .setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
          .setDescription(
            `Logo abaixo está as informações que eu encontrei sobre esse servidor.`
          )
          .addField(
            `\u200B`,
            `**Nome » ** \`\`\`yaml\n${msg.guild.name}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**ID » ** \`\`\`yaml\n${msg.guild.id}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Membros » ** \`\`\`yaml\n${msg.guild.memberCount}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Cargos » ** \`\`\`yaml\n${msg.guild.roles.cache.size}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Canais Text/voice » ** \`\`\`yaml\n${
              msg.guild.channels.cache.filter(
                (channelCount) => channelCount.type === 'text'
              ).size
            }/${
              msg.guild.channels.cache.filter(
                (channelCount) => channelCount.type === 'voice'
              ).size
            }\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Região » ** \`\`\`yaml\n${msg.guild.region}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Criador » ** \`\`\`diff\n- ${msg.guild.owner.user.tag}\`\`\``,
            false
          )
          .addField(
            `\u200B`,
            `**Cargos » ** \`\`\`ini\n[${roles.array().join(', ')}]\`\`\``,
            false
          )
          .setTimestamp()
          .setFooter(
            `Copyright © 2020 ${bot.user.username}`,
            bot.user.avatarURL()
          );

        msg.channel.send(userInfosEmbed);
      } catch (error) {
        msg.channel.send(
          configuration.comandos.unlock.possivelErro
            .replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
            .replace('$USERNAME', msg.member.user.username)
            .replace('$USER_TAG', msg.member.user.discriminator)
            .replace('$ERROR_MESSAGE', error.message)
        );
        return `Houve um erro ao enviar mensagem ao canal ${msg.channel.id}`;
      }
    };
  }
}

module.exports = new ServerInfo();
