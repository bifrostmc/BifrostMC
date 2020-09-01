exports.up = (knex) =>
	knex.schema.createTable('raffles', (table) => {
		table.increments('id');
		table.string('guild_id', 25);
		table.string('channel_id', 25);
		table.string('message_id', 25);
		table.string('author_id', 25);
		table.text('description');
		table.float('due_date');

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable('raffles');
