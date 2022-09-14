# Recipe Manager - A Full Stack app built with Node, React, PostgreSQL, REST API

## Features

- Express Backend and React Frontend
- Database with PostgreSQL
- Unit tests for functions with Jest
- Unit tests for route handlers and middleware with [node-mocks-http](https://github.com/howardabrams/node-mocks-http)
- Integration tests for routes with [supertest](https://github.com/visionmedia/supertest)

## Database setup

1. Start PostgreSQL with `brew services start postgresql`.
2. Create the database: `createdb reciperest`.
3. Start psql with `psql reciperest`.
4. In psql, run the commands in `server/database.sql` by loading it with `\i server/database-setup.sql`.

## Database seed

Once the database is created, you can automatically fill the database with recipes.

To add recipes you need a user. If you don't have one, start the server (`cd server && npm run dev`) and then in another terminal do:
`curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}'`.

Once you have a user, make sure that its id matches the `user_id` in `server/database-seed.sql`.

Finally, seed data into the database by doing `psql reciperest` and `\i server/database-seed.sql`.

## Develop

```shell
cd server
npm install
npm start
```

```shell
cd web
npm install
npm start
```

## Git pre-commit hook to run Prettier, ESLint and TypeScript checks on every commit

To run Prettier and ESLint on every commit, run `cp pre-commit .git/hooks`.

Note that the checks do not abort the commit, they only inform you of any issues found.
