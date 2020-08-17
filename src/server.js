import { config } from 'dotenv';
import Bot from './bot';

config();

(() => new Bot())();
