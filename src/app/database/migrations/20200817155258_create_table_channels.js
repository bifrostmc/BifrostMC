exports.up = (knex) =>
	knex.schema.createTable('channels', (table) => {
		table.increments('id');
		table.text('channel_id');
		table.text('guild_id');
		table.text('function');

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable('channels');
