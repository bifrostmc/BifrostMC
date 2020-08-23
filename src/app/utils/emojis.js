import server from '../../server';

export default class Emojis {
	static FLAGS = {
		brazil: '746814240131776594',
		europe: '746814240031113267',
		hongkong: '746814240194822156',
		japan: '746814239926124565',
		india: '746814240530104420',
		russia: '746814240202948791',
		singapore: '746814240483966976',
		sydney: '746814240710721636',
		'us-south': '746814240593150053',
		'us-east': '746814240593150053',
		'us-central': '746814240593150053',
		'us-west': '746814240593150053',
		southafrica: '746814240400212079',
	};
	static get(name = 'brazil') {
		return server.Bot.bot.emojis.cache.get(this.FLAGS[name]);
	}
}
