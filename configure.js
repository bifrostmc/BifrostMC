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
			// Essa mensagem é mandada quando o usuário limpa uma quantidade de mensagens com o $clear
			apagouMensagens:
				':broom: $MENTION_USER_SEND, você limpou `$MESSAGES_DELETED` mensagens. :broom:',

			// Essa mensagem é mandada quando há um erro ao deletar as mensagens
			errorApagarMensagem: 'Houve um erro para deletar as mensagens.',
		},
		lock: {
			// Essa mensagem é enviada quando um administrador bloqueia o canal com sucesso
			bloqueado:
				'🔒 O administrador $MENTION_USER_SEND bloqueou o canal, então espere até desbloquea-lo para enviar mensagens. 🔒',

			// Essa mensagem é mandada quando o canal já está bloqueado
			jaBloqueado: '🔒 $MENTION_USER_SEND Esse canal já está bloqueado! 🔒',

			// Essa mensagem é quando não é possível desbloquear o canal
			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		unlock: {
			// A mensagem abaixo é quando o usuário consegue desbloquear o canal com sucesso
			desbloquear:
				'🔓 O administrador $MENTION_USER_SEND desbloqueou o canal, então agora você pode falar nele. 🔓',

			// Essa mensagem é para quando o canal já está desbloqueado
			jaDesbloqueado:
				'🔓 $MENTION_USER_SEND O canal atual não está bloqueado, então não pode desbloquear! 🔓',

			// Aqui é quando um erro não indentificado pode acontecer
			possivelErro:
				'⁉️ $MENTION_USER_SEND Houve um erro desconhecido, porfavor tente novamente mais tarde ⁉️',
		},
		help: {
			// Essa mensagem é enviada quando o usuario digita um comando no help invalido, por exemplo
			// $help smcodes
			// Para especificar o comando que ele mesmo escreveu coloque $COMANDO
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
	},
};
