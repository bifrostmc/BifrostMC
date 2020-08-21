import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import configuration from '../../../configure';

class UserInfo {
  constructor() {
    this.config = {
      name: 'userinfo',
      aliases: [],
      help: 'Com esse comando você pode ver suas informações como um usuário.',
      requiredPermissions: [],
    };

    this.run = async ({ msg, bot }) => {
      try {
        let userInfosEmbed = new MessageEmbed()
          .setColor('RANDOM')
          .setTitle('📃 ** Suas informações ¹ ** 📃')
          .setAuthor(`${msg.author.username} infos`, msg.author.avatarURL())
          .setThumbnail(msg.author.avatarURL())
          .setDescription(
            'Logo abaixo está as informações principais que eu tenho sobre o sua conta, considerando suas informações como usuário e membro.'
          )
          .addField(
            `\u200B`,
            `**Nome » **\`\`\`yaml\n${msg.author.username}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Tag » **\`\`\`yaml\n${msg.author.discriminator}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**ID » **\`\`\`yaml\n${msg.author.id}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Cargo » **\`\`\`yaml\n${msg.member.roles.highest.name}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Status » **\`\`\`yaml\n${msg.author.presence.status}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Ultima entrada » **\`\`\`yaml\n${moment(
              msg.author.joinedAt
            ).format('HH:mm:ss - DD/MM/YYYY')}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Criado em » **\`\`\`yaml\n${moment(msg.author.createdAt).format(
              'HH:mm:ss - DD/MM/YYYY'
            )}\`\`\``,
            true
          )
          .setTimestamp()
          .setFooter(
            `Copyright © 2020 ${bot.user.username}`,
            bot.user.avatarURL()
          );

        const msgInfos = await msg.channel.send(userInfosEmbed);

        await msgInfos.react('➡️');

        const functionsCollection = {
          '➡️': async () => {
            msgInfos.reactions.removeAll();
            const embedInfosPageTwo = new MessageEmbed()
              .setColor('RANDOM')
              .setTitle('📃 ** Suas informações ² ** 📃')
              .setAuthor(`${msg.author.username} infos`, msg.author.avatarURL())
              .setThumbnail(msg.author.avatarURL())
              .setDescription(
                'Logo abaixo está as informações secundário que eu tenho sobre o sua conta, considerando suas informações como usuário e membro.'
              )
              .addField(
                `\u200B`,
                `**Cargos » ** [${msg.member.roles.cache.array().join(', ')}]`,
                true
              )
              .setTimestamp()
              .setFooter(
                `Copyright © 2020 ${bot.user.username}`,
                bot.user.avatarURL()
              );

            try {
              await msgInfos.edit(embedInfosPageTwo);

              await msgInfos.react('⬅️');

              const filter = (reaction, user) => user.id === msg.author.id;

              const collector = msgInfos.createReactionCollector(filter);

              collector.on('collect', async (reaction, user) => {
                const emoji = reaction.emoji.id || reaction.emoji.name;

                if (functionsCollection[emoji]) {
                  await functionsCollection[emoji]();
                } else {
                  this.run({ msg, bot });
                }
              });
            } catch (error) {
              msg.channel.send(
                configuration.comandos.unlock.possivelErro
                  .replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
                  .replace('$USERNAME', msg.member.user.username)
                  .replace('$USER_TAG', msg.member.user.discriminator)
                  .replace('$ERROR_MESSAGE', error.message)
              );
              return `Houve um erro ao desbloquear o canal ${msg.channel.id}`;
            }
          },
        };

        const filter = (reaction, user) =>
          !!functionsCollection[reaction.emoji.id || reaction.emoji.name] &&
          user.id === msg.author.id;

        const collector = msgInfos.createReactionCollector(filter);

        collector.on('collect', async (reaction, user) => {
          const emoji = reaction.emoji.id || reaction.emoji.name;

          await functionsCollection[emoji]();
        });
      } catch (error) {
        msg.channel.send(
          configuration.comandos.unlock.possivelErro
            .replace('$MENTION_USER_SEND', `<@${msg.author.id}>`)
            .replace('$USERNAME', msg.member.user.username)
            .replace('$USER_TAG', msg.member.user.discriminator)
            .replace('$ERROR_MESSAGE', error.message)
        );
        return `Houve um erro ao desbloquear o canal ${msg.channel.id}`;
      }
    };
  }
}

module.exports = new UserInfo();
