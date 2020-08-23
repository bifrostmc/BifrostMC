exports.up = (knex) =>
	knex.schema.createTable('banned', (table) => {
		table.increments('id');
		table.string('guild_id', 25);
		table.string('user_banned_id', 25).unique();
		table.string('author_id', 25);
		table.float('due_date');
		table.boolean('is_due_date');

		table.timestamp('created_at').defaultTo(knex.fn.now());
	});

// 360247173356584960

exports.down = (knex) => knex.schema.dropTable('banned');
