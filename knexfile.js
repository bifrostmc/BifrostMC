// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://fxhghyiuxikqwc:266638e1105ee1a1730a46498cac1a9fd2d11b000e47238d4aa98e3f99e94120@ec2-52-72-34-184.compute-1.amazonaws.com:5432/ddu0ou2echk392?ssl=true',
    migrations: {
      directory: `${__dirname}/src/app/database/migrations`,
    },
    seeds: {
      directory: `${__dirname}/src/app/database/seeds`,
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  onUpdateTrigger: table  => `
  CREATE TRIGGER ${table}_updated_at
  BEFORE UPDATE ON ${table}
  FOR EACH ROW
  EXECUTE PROCEDURE on_update_timestamp();
  `,
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
