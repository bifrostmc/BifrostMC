import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import configuration from '../../../configure';
import Emojis from '../utils/emojis';

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
          .setTitle(
            `<:caderneta:746814240513589299> ** Sobre nossa comunidade! **`
          )
          .setAuthor(
            `Informações | ${msg.guild.name}`,
            msg.guild.iconURL() || bot.user.avatarURL()
          )
          .setThumbnail(msg.guild.iconURL() || bot.user.avatarURL())
          .setDescription(
            `Irei descrever as informações encontradas em ${msg.guild.name}. Lembre-se de que elas serão alteradas frequentemente! Com base nas informações atuais presentes no servidor.`
          )
          .addField(
            `\u200B`,
            `<:displaytext:746814240396148757> **Nome » ** \`\`\`yaml\n${msg.guild.name}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `<:id_vector:746814239875792957> **ID » ** \`\`\`yaml\n${msg.guild.id}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `<:user:746814240605733014> **Membros » ** \`\`\`yaml\n${msg.guild.memberCount}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `<:nuvem_download:746815405355696178> **Cargos » ** \`\`\`yaml\n${msg.guild.roles.cache.size}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `<:caixa:746814240211337276> **Canais Text/voice » ** \`\`\`yaml\n${
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
            `${Emojis.get(msg.guild.region)} **Região » ** \`\`\`yaml\n${
              msg.guild.region
            }\`\`\``,
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
