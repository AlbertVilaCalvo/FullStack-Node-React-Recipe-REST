# GitHub Copilot Instructions for RecipeREST

This project is a web application that allows users to manage cooking recipes. It's built using React on the client and Node.js on the server, with a PostgreSQL database.

## Project Overview & Architecture

- `/server`: A Node.js/Express.js REST API backend.
- `/web`: A React single-page application.
- `/aws`: Contains scripts and assets for AWS deployment, like CloudFront functions.

The server follows a three-layer architecture for organizing business logic:

1. Controllers (`/server/src/**/*Controller.ts`): Handle HTTP requests and responses. They are responsible for input validation and calling services.
2. Services (`/server/src/**/*Service.ts`): Contain the core application logic and orchestrate operations.
3. Database (`/server/src/**/*Database.ts`): Encapsulate all direct database interactions using the `pg` library.

## Coding Standards & Conventions

- TypeScript: The entire codebase is written in TypeScript. Avoid JavaScript.
- Code Style: Prettier is used for formatting. Adhere to its conventions (single quotes, no semicolons, 2-space indentation and trailing commas).
- Asynchronous Code: Prefer `async/await` for asynchronous operations.

## Server Patterns

- Error Handling: The server endpoints return a custom `ApiError` class (`/server/src/misc/ApiError.ts`) for expected errors (e.g., "not found", "invalid input"). Unexpected errors are caught by the `unexpectedErrorHandler` middleware.
- Result: Database functions return a result (`/server/src/misc/result.ts`) discriminated union.
- Use Jest for unit tests.
- Use Supertest for integration tests.

## Frontend Patterns

- State Management: Global state is managed with Valtio.
- API Communication: All HTTP requests to the backend are centralized in API modules (e.g., `/web/src/recipe/RecipeApi.ts`) which use a shared `httpClient.ts`.
- UI Components: The UI is built using Chakra UI. When creating new components, use Chakra components whenever possible.
- Navigation: React Router is used for client-side routing. Define routes in `/web/src/App.tsx` and use the `useNavigate` hook for navigation within components.
