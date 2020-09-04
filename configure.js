const prefix = process.env.PREFIX;
// Váriaveis estáticas:

// $MESSAGES_DELETED = recebe o numero de mensagens deletadas no comando {clear}
// Config disponíveis para essa variavel
// [*_CLEAR]

// $USER_NAME = recebe o username do usuario que executou o comando, exemplo: SMCodes
// Config disponíveis para essa variavel
// [*_CLEAR, *_LOCK, *_UNLOCK, *_HELP]

// $USER_TAG = recebe o discriminador do usuario que executou o comando, exemplo: 4207
// Config disponíveis para essa variavel
// [*_CLEAR, *_LOCK, *_UNLOCK, *_HELP]

// $MENTION_USER_SEND = Mencionar usuario que mandou o comando
// Config disponíveis para essa variavel
// [*_CLEAR, *_LOCK, *_UNLOCK, *_HELP]

// $ERROR_MESSAGE = Mensagem do possível erro que aconteceu no comando, não recomendo usar essa variavel por geralmente ser uma mensagem gigantesca
// Config disponíveis para essa variavel
// [errorApagarMensagem_CLEAR, possivelErro_LOCK, desbloquear_UNLOCK]

// $COMANDO_MENCIONADO = Mostra o comando que o usuario mencionou no seu primeiro algumento
// Config disponíveis para essa variavel
// [embeds_*_HELP]

// $MESSAGE_HELP_COMMAND = Mostra a mensagem de help do comando
// Config disponíveis para essa variavel
// [embeds_comandoEspecifico_*_HELP]

export default {
	comandos: {
		clear: {
			apagouMensagens:
				':broom: $MENTION_USER_SEND, você limpou `$MESSAGES_DELETED` mensagens. :broom:',

			errorApagarMensagem: 'Houve um erro para deletar as mensagens.',
		},
		lock: {
			bloqueado:
				'🔒 O administrador $MENTION_USER_SEND bloqueou o canal, então espere até desbloquea-lo para enviar mensagens. 🔒',

			jaBloqueado: '🔒 $MENTION_USER_SEND Esse canal já está bloqueado! 🔒',

			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		unlock: {
			desbloquear:
				'🔓 O administrador $MENTION_USER_SEND desbloqueou o canal, então agora você pode falar nele. 🔓',

			jaDesbloqueado:
				'🔓 $MENTION_USER_SEND O canal atual não está bloqueado, então não pode desbloquear! 🔓',

			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		help: {
			comandoInvalido: `📎 Comando digitado inválido, porfavor digite um comando válido para ser usuado no \`${prefix}help {comando válido}\` 📎`,

			embeds: {
				comandoEspecifico: {
					title: '**Informações sobre o comando $COMANDO_MENCIONADO**',
					description: `**Uso: **
						$MESSAGE_HELP_COMMAND
						\n\n**Exemplo de uso:
						\`${prefix}$COMANDO_MENCIONADO\`**
						`,
				},
				todosComandos: {
					title: '**Lista dos meus comandos disponíveis**',
					description: `Para saber mais sobre um comando digite: \`${prefix}help {comando}\`\n\n`,
				},
			},
		},
		ban: {
			syntaxIncorreta: `⁉️ Utilize \`${prefix}ban <@usuário/user_id> {tempo} {data_type = [days, months, years]}\`! Caso queira uma punição permanente apenas não informe o tempo a ser banido\nPor exemplo » ${prefix}ban $MESSAGE_AUTHOR 7 days. ⁉️`,

			naoEncontrado: '⁉️ Não foi possível encontrar este usuário. ⁉️',

			digiteRazao:
				'<:displaytext:746814240396148757> Digite uma razão para o usuário ser banido <:displaytext:746814240396148757>',
		},
		mute: {
			syntaxIncorreta: `⁉️ Utilize \`${prefix}mute <@usuário/user_id> {tempo} {data_type = [days, months, years]}\`! Caso queira uma punição com o tempo indefinido use dessa forma\nPor exemplo » \`${prefix}mute $MESSAGE_AUTHOR\`. ⁉️`,

			naoEncontrado: '⁉️ Não foi possível encontrar este usuário. ⁉️',
			digiteRazao:
				'<:displaytext:746814240396148757> Digite uma razão para o usuário ser mutado <:displaytext:746814240396148757>',

			digiteRazao:
				'<:displaytext:746814240396148757> Digite uma razão para o usuário ser mutado <:displaytext:746814240396148757>',
		},
		unmute: {
			syntaxIncorreta: `⁉️ Syntax incorreta, utilize dessa forma \`${prefix}unmute <@usuário/user_id\nPor exemplo » \`${prefix}unmute $MESSAGE_AUTHOR\`. ⁉️`,

			naoEncontrado: '⁉️ Não foi possível encontrar este usuário. ⁉️',
			naoEncontradoDB: '⁉️ O usuário mencionado não foi mutado. ⁉️',

			digiteRazao:
				'<:displaytext:746814240396148757> Digite uma razão para o usuário ser mutado <:displaytext:746814240396148757>',
		},
		demote: {
			syntaxIncorreta: `⁉️ Sintaxe incorreta, use dessa forma \`${prefix}demote {@user/user_id} {@cargo/cargo_id}\` ⁉️`,

			cargoMenor:
				'<:check_error:745344787087098008> Desculpe você não pode retirar um cargo maior ou igual ao seu. <:check_error:745344787087098008>',

			demoteCancelado: `<:check_error:745344787087098008> Afastamento cancelado com sucesso! <:check_error:745344787087098008>`,

			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		promote: {
			syntaxIncorreta: `⁉️ Sintaxe incorreta, use dessa forma \`${prefix}promote {@user/user_id} {@cargo/cargo_id}\` ⁉️`,

			cargoMenor:
				'<:check_error:745344787087098008> Desculpe você não pode adicionar um cargo maior ou igual ao seu. <:check_error:745344787087098008>',

			promoteCancelado: `<:check_error:745344787087098008> Promoção cancelada com sucesso! <:check_error:745344787087098008>`,

			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		denunciar: {
			syntaxIncorreta: `⁉️ Sintaxe incorreta, use dessa forma \`${prefix}denunciar {@user/user_id}\`, após executar o comando iniciará uma sessão de perguntas para a denuncia ser concluída ⁉️`,
			naoAchouCanal:
				'⁉️ $MENTION_USER_SEND, nenhum canal registrado para receber denúncias. ⁉️',

			motivoDenuncia: `❗ Digite o motivo da denúncia ao usuário \`$MENTION_TAG\`. (2 Minutos) (Obrigatório) ❗`,
			cancelarDenuncia: `Digite \`cancelar\` para sair da sessão de denúncia.`,
			saiuDenuncia:
				'<:check_error:745344787087098008> Você saiu da sessão de denúncia com sucesso, você pode abrir outra a qualquer momento. <:check_error:745344787087098008>',

			enviarLinks: `<:alert:745345548424314881> Agora envie links para comprovar sua denúncia (Obrigatório) <:alert:745345548424314881>`,
			linksObrigatorios: `❗ Você não incluiu links de referências para imagens/videos, então sua denúncia foi cancelada por esse motivo. ❗`,

			pv: {
				aceitou: {
					admin:
						'🎉 O usuário foi banido com sucesso! Obrigado pela colaboração 🎉',

					author: `🎉 Parabéns sua denúncia ao usuário \`$MENTION_TAG\`. 🎉\nAgradecemos pela sua colaboração e pedimos que continue a reportar novos possíveis infratores.`,
					denunciado: `<:check_error:745344787087098008> Você foi denúnciado e recebeu um ban, de nosso servidor \`$GUILD_NAME\`, veja a denúncia logo abaixo <:check_error:745344787087098008>\n$PREVIEW_REPORT`,
				},
				rejeitou: {
					admin:
						'🎉 O usuário foi liberado com sucesso! Obrigado pela colaboração 🎉',

					author: `<:check_error:745344787087098008> Infelizmente sua denúncia ao usuário \`$MENTION_TAG\` foi desaprovada, caso tenha alguma dúvida entre em contato com \`$APLICATOR\`. <:check_error:745344787087098008>\nAgradecemos pela sua colaboração e pedimos que continue a reportar novos possíveis infratores.`,
				},
			},

			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		raffle: {
			syntaxIncorreta: `⁉️ Sintaxe incorreta, use dessa forma por exemplo \`${prefix}raffle {tempo} {[days, months, years]}\` ⁉️`,
		},
	},
};
