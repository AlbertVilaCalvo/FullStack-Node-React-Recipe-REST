# Recipe Manager - A Full Stack app built with Node, React, PostgreSQL, REST API

## Database setup

1. Start PostgreSQL with `brew services start postgresql`.
2. Create the database: `createdb reciperest`.
3. Start psql with `psql reciperest`.
4. In psql, run the commands in `server/database.sql` by loading it with `\i server/database-setup.sql`.
5. (Optional) Seed data into the database with `\i server/database-seed.sql` .

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
