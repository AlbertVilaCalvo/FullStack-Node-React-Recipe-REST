# Recipe Manager

_A Full Stack app built with Node, React, PostgreSQL, REST API, AWS and GitHub Actions_

Live site: https://recipeapp.link

## Technologies used

### Tools

- Code quality with ESLint.
- Auto-formatting with Prettier.
- CI/CD with GitHub Actions.
- 100% TypeScript, no JavaScript.

### Frontend

- Single Page Web application built with React.
- State management with [Valtio](https://github.com/pmndrs/valtio).
- Routing with [React Router](https://reactrouter.com/en/main) 6.
- UI design with [Chakra UI](https://chakra-ui.com).

### Backend

- Node.js server built with Express.js.
- Database with PostgreSQL.
- Data validation with [zod](https://github.com/colinhacks/zod).
- Testing
  - Unit tests for functions with Jest.
  - Unit tests for route handlers and middleware with [node-mocks-http](https://github.com/howardabrams/node-mocks-http).
  - Integration tests for routes with [supertest](https://github.com/visionmedia/supertest).

### AWS

- Frontend deployed to S3 and CloudFront automatically using GitHub actions.

## Features

- Authentication: register, login, validate email, recover password.
- Settings: change user name, email and password. Delete user account.
- Recipe: publish, edit and delete recipes.

## Database setup

1. Start PostgreSQL with `brew services start postgresql`.
2. Create the database: `createdb recipemanager`. (If the database already exists do `dropdb recipemanager && createdb recipemanager`.)
3. Start psql with `psql recipemanager`.
4. In psql, create the tables by running `\i server/database-setup.sql`.

(Exit psql with Ctrl+D or `\q`.)

## Database seed

Once the database is created, you can automatically fill the database with some recipes with `server/database-seed.sql`.

Note that you need two users with ids 1 and 2. If you don't have the two users yet, start the server (`cd server && npm start`) and in another terminal run:

- `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}'`
- `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Pere", "email":"b@b.com", "password":"123456"}'`

Once you have two users with ids 1 and 2, seed data into the database by doing `psql recipemanager` and `\i server/database-seed.sql`.

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

## Manually deploy React web app to AWS S3 and CloudFront

Note that there's a GitHub action that does this automatically.

```
cd web
npm run build
aws s3 sync build s3://<s3-bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <cf-distribution-id> --paths '/*'
```
