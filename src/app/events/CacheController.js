import { Collection } from 'discord.js';

import knex from '../database';

const cache = [
	{
		name: 'channels',
		key: 'function',
	},
	{
		name: 'suggestions',
		key: 'message_id',
	},
];

class CacheController {
	static async updateCache(bot, nameCache) {
		if (!nameCache) {
			bot.cache_control = {};

			cache.map(async ({ name, key }) => {
				bot.cache_control[name] = new Collection();

				const cacheItems = await knex(name);

				cacheItems.map((cacheItemSigle) =>
					bot.cache_control[name].set(cacheItemSigle[key], cacheItemSigle)
				);
			});
		} else {
			const cacheItem = cache.find(
				(cacheFindingItem) => cacheFindingItem.name === nameCache
			);
			if (!cacheItem) return;
			bot.cache_control[nameCache] = new Collection();

			const cacheItems = await knex(nameCache);

			cacheItems.map((cacheItemSigle) =>
				bot.cache_control[nameCache].set(
					cacheItemSigle[cacheItem.key],
					cacheItemSigle
				)
			);
		}
		console.log(bot.cache_control);
	}
}

export default CacheController;
