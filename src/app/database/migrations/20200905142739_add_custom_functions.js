const { onUpdateTrigger } = require('../../../../knexfile')

exports.up = (knex) => knex.schema.createTable('presences', (table) => {
		table.increments('id');
		table.string('user_id', 25).unique();
		table.string('status', 25);

		table.timestamp('updated_at').defaultTo(knex.fn.now());
		table.timestamp('created_at').defaultTo(knex.fn.now());
	}).then(() => knex.raw(onUpdateTrigger('presences')));

exports.down = (knex) => knex.schema.dropTable('presences');
