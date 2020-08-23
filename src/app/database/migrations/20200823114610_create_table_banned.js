exports.up = (knex) =>
	knex.schema.createTable('banned', (table) => {
		table.increments('id');
		table.text('guild_id');
		table.text('user_banned_id').unique();
		table.text('author_id');
		table.text('due_date');

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

exports.down = (knex) => knex.schema.dropTable('banned');
