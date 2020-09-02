exports.up = (knex) =>
	knex.schema.createTable('tickets', (table) => {
		table.increments('id');
		table.string('guild_id', 42);
		table.string('user_id', 42);
		table.string('name_channel', 42);
		table.string('channel_id', 42);

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable('tickets');
