import { config } from 'dotenv';
import Bot from './app/bot';

config();

(() => new Bot())();
