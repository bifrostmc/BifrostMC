exports.up = (knex) =>
	knex.schema.createTable('tickets', (table) => {
		table.increments('id');
		table.string('guild_id', 25);
		table.string('user_id', 25);
		table.string('name_channel', 25);
		table.string('channel_id', 25);

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable('tickets');
