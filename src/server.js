import { config } from 'dotenv';
import Bot from './bot';
import Web from './web';

config();

export default {
	Bot: new Bot(),
	Web: new Web(process.env.PORT || 3333),
};
