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

    this.run = async ({ msg, bot, args }) => {
      let user = {};

      if (args.length > 0) {
        const userMention =
          msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

        if (userMention) {
          user = {
            avatarURL: userMention.user.avatarURL(),
            username: userMention.user.username,
            discriminator: userMention.user.discriminator,
            id: userMention.user.id,
            presence_status: userMention.user.presence.status,
            joinedAt: userMention.joinedAt,
            createdAt: userMention.user.createdAt,
            roles: userMention.roles,
          };
        } else {
          msg.channel
            .send(
              `⁉️ Sintaxe incorreta, use dessa forma \`${prefix}promote {@user/user_id} {@cargo/cargo_id}\` ⁉️`
            )
            .then((msg) => msg.delete({ timeout: 15000 }));
          return 'O usuário digitou o comando em um sintaxe incorreta.';
        }
      } else {
        user = {
          avatarURL: msg.author.avatarURL(),
          username: msg.author.username,
          discriminator: msg.author.discriminator,
          id: msg.author.id,
          presence_status: msg.author.presence.status,
          joinedAt: msg.member.joinedAt,
          createdAt: msg.author.createdAt,
          roles: msg.member.roles,
        };
      }

      try {
        let userInfosEmbed = new MessageEmbed()
          .setColor('RANDOM')
          .setTitle(
            `📃 ** ${
              args.length > 0 ? user.username : 'Suas'
            } informações ² ** 📃`
          )
          .setAuthor(`${user.username} infos`, user.avatarURL)
          .setThumbnail(user.avatarURL)
          .setDescription(
            `Logo abaixo está as informações principais que eu tenho sobre ${
              args.length > 0
                ? `a conta do usuário ${user.username}`
                : 'o sua conta'
            }, considerando informações como usuário e membro.`
          )
          .addField(
            `\u200B`,
            `**Nome » **\`\`\`yaml\n${user.username}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Tag » **\`\`\`yaml\n${user.discriminator}\`\`\``,
            true
          )
          .addField(`\u200B`, `**ID » **\`\`\`yaml\n${user.id}\`\`\``, true)
          .addField(
            `\u200B`,
            `**Cargo » **\`\`\`yaml\n${user.roles.highest.name}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Status » **\`\`\`yaml\n${user.presence_status}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Entrada » **\`\`\`yaml\n${moment(user.joinedAt).format(
              'HH:mm:ss - DD/MM/YYYY'
            )}\`\`\``,
            true
          )
          .addField(
            `\u200B`,
            `**Criado em » **\`\`\`yaml\n${moment(user.createdAt).format(
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
              .setTitle(
                `📃 ** ${
                  args.length > 0 ? user.username : 'Suas'
                } informações ² ** 📃`
              )
              .setAuthor(`${user.username} infos`, user.avatarURL)
              .setThumbnail(user.avatarURL)
              .setDescription(
                `Logo abaixo está as informações secundária que eu tenho sobre ${
                  args.length > 0
                    ? `a conta do usuário ${user.username}`
                    : 'o sua conta'
                }, considerando informações como usuário e membro.`
              )
              .addField(
                `\u200B`,
                `**Cargos » ** [${user.roles.cache.array().join(', ')}]`,
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
                  this.run({ msg, bot, args });
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
