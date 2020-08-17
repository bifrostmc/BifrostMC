// Váriaveis dinâmicas:

// $MESSAGES_DELETED = recebe o numero de mensagens deletadas no comando {clear}
// Comandos disponíveis para essa variavel [clear]

// $USER_NAME = recebe o username do usuario que executou o comando, exemplo: SMCodes
// Comandos disponíveis para essa variavel [clear]

// $USER_TAG = recebe o discriminador do usuario que executou o comando, exemplo: 4207
// Comandos disponíveis para essa variavel [clear]

// $ERROR_MESSAGE = Mensagem do possível erro que aconteceu no comando, não recomendo usar essa variavel por geralmente ser uma mensagem gigantesca
// Comandos disponíveis para essa variavel [clear]

export default {
	comandos: {
		clear: {
			apagouMensagens: 'Você limpou `$MESSAGES_DELETE` mensagens.',
			errorApagarMensagem: 'Houve um erro para deletar as mensagens.',
		},
		help: {
			apagouMensagens: 'Você limpou `$MESSAGES_DELETE` mensagens.',
			errorApagarMensagem: 'Houve um erro para deletar as mensagens.',
		},
	},
};
