# Recipe Manager - A Full Stack app built with Node, React, PostgreSQL, REST API

## Database setup

1. Start PostgreSQL with `brew services start postgresql`.
2. Create the database: `createdb reciperest`.
3. Start psql with `psql reciperest`.
4. In psql, run the commands in `server/database.sql` by loading it with `\i server/database-setup.sql`.

## Database seed

Once the database is created, you can automatically fill the database with recipes.

To add recipes you need a user. If you don't have one, start the server (`cd server && npm run dev`) and then do: `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}'`.

Once you have a user, make sure that its id matches the `user_id` in `server/database-seed.sql`.

Finally, seed data into the database by doing `psql reciperest` and `\i server/database-seed.sql`.

## Develop

```
cd server
npm run dev
```

```
cd web
npm start
```

## Git hook to run Prettier, ESLint and TypeScript checks on every commit

To run Prettier and ESLint on every commit, run `cp pre-commit .git/hooks`.

Note that the checks do not abort the commit, they only inform you of any issues found.
