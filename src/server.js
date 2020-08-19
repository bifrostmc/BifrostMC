import { config } from 'dotenv';
import Bot from './bot';
import Web from './web';

config();

(() => {
	new Bot();
	new Web(process.env.PORT || 3333);
})();
