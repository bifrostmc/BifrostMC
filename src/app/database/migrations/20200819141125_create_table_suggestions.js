exports.up = (knex) =>
	knex.schema.createTable('suggestions', (table) => {
		table.increments('id');
		table.text('guild_id');
		table.text('channel_id');
		table.text('message_id');
		table.text('author_id');

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable('suggestions');
