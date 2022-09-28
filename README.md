# Recipe Manager - A Full Stack app built with Node, React, PostgreSQL, REST API

## Features

- Express Backend and React Frontend
- Database with PostgreSQL
- Unit tests for functions with Jest
- Unit tests for route handlers and middleware with [node-mocks-http](https://github.com/howardabrams/node-mocks-http)
- Integration tests for routes with [supertest](https://github.com/visionmedia/supertest)
- Data validation with [zod](https://github.com/colinhacks/zod)

## Database setup

1. Start PostgreSQL with `brew services start postgresql`.
2. Create the database: `createdb reciperest`. (If the database already exists do `dropdb reciperest && createdb reciperest`.)
3. Start psql with `psql reciperest`.
4. In psql, create the tables by running `\i server/database-setup.sql`.

(Exit psql with Ctrl+D or `\q`.)

## Database seed

Once the database is created, you can automatically fill the database with some recipes with `server/database-seed.sql`.

Note that you need two users with ids 1 and 2. If you don't have the two users yet, start the server (`cd server && npm start`) and in another terminal run:

- `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}'`
- `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Pere", "email":"b@b.com", "password":"123456"}'`

Once you have two users with ids 1 and 2, seed data into the database by doing `psql reciperest` and `\i server/database-seed.sql`.

(Exit psql with Ctrl+D or `\q`.)

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

## Email account setup

Sending emails requires creating an account at https://ethereal.email. Click the 'Create Ethereal Account' button and copy-paste the user and password to the `.env` file environment variables `EMAIL_USER` and `EMAIL_PASSWORD`.

You can view the emails at https://ethereal.email/messages. URLs to view each email sent are also logged at the server console.

## Git pre-commit hook to run Prettier, ESLint and TypeScript checks on every commit

To run Prettier and ESLint on every commit, run `cp pre-commit .git/hooks`.

Note that the checks do not abort the commit, they only inform you of any issues found.
