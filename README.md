# Recipe Manager

_A Full Stack app built with Node, React, PostgreSQL, REST API, AWS and GitHub Actions_

Live site: https://recipeapp.link

## Technologies used

### Tools

- CI/CD with GitHub Actions.
- 100% TypeScript, zero JavaScript.
- Local development with Docker Compose.
- Code quality with ESLint.
- Auto-formatting with Prettier.

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

## Develop

The application is available at:

- Web (React): http://localhost:3000
- Server (API): http://localhost:5000
- Database: localhost:5432

To run the app locally do:

```shell
cp .env.dev.sample .env

# Start all services
docker compose up --build

# View service status
docker compose ps

# Stop everything, but keep the database data
docker compose down
# Stop everything and discard the database data
docker compose down --volumes
```

To run only a single service do:

```shell
cd server # Or cd web
npm install
npm run dev
```

## Database

The database is created automatically when you run `docker compose up --build`. You can interact with it from within the Docker container.

```shell
# Connect to database from within the Docker container
docker compose exec db psql -U postgres -d recipemanager

# Backup database
docker compose exec db pg_dump -U postgres recipemanager > backup.sql

# Restore database
docker compose exec -T db psql -U postgres -d recipemanager < backup.sql
```

The database port is exposed to `localhost:5432` on the host machine. This allows you to connect to the database using a client from your machine.

```shell
# Connect to database from your host machine
psql -h localhost -p 5432 -U postgres -d recipemanager
```

You will be prompted for the password, which is defined in your `.env` file.

### Seed the database

Once the database is created, you can automatically fill the database with users and recipes using the provided script:

```shell
./scripts/seed-database.sh
```

This script will:

1. Create two test users.
2. Seed the database with sample recipe data.

Alternatively, you can run the steps manually:

- `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Albert", "email":"a@a.com", "password":"123456"}'`
- `curl http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Blanca", "email":"b@b.com", "password":"123456"}'`
- `docker compose exec -T db psql -U postgres -d recipemanager < server/database-seed.sql`

## Email account setup

Sending emails requires creating an account at https://ethereal.email. Click the 'Create Ethereal Account' button and copy-paste the user and password to the `.env` file environment variables `EMAIL_USER` and `EMAIL_PASSWORD`.

You can view the emails at https://ethereal.email/messages. URLs to view each email sent are also logged at the server console.

## Git pre-commit hook to run Prettier, ESLint and TypeScript checks on every commit

To run Prettier and ESLint on every commit, run `cp pre-commit .git/hooks`.

Note that the checks do not abort the commit, they only inform you of any issues found.

## Manually deploy React web app to AWS S3 and CloudFront

Note that there's a GitHub action that does this automatically.

```shell
cd web
npm run build
aws s3 sync build s3://<s3-bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <cf-distribution-id> --paths '/*'
```
