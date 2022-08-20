# Recipe manager - Full Stack Node, React, PostgreSQL, REST app

## Database setup

1. Start PostgreSQL with `brew services start postgresql`.
2. Create the database: `createdb reciperest`.
3. Start psql with `psql reciperest`.
4. In psql, run the commands in `server/database.sql` by loading it with `\i server/database-setup.sql`.

## Develop

```
cd server
npm run dev
```

```
cd web
npm start
```

## Git hook to run Prettier and ESLint checks on every commit

To run Prettier and ESLint on every commit, run `cp pre-commit .git/hooks`.

Note that the checks do not abort the commit, they only inform you of any issues found.
