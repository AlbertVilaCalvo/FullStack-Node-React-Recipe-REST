# GitHub Copilot Instructions for Recipe Manager

This project is a web application that allows users to manage cooking recipes. It's built using React on the client and Node.js on the server. Uses PostgreSQL for data storage. It's deployed on AWS.

## General Guidelines

- Update README.md with setup and usage instructions.

## Folder Structure

- `/server`: Contains the source code for the Node.js backend.
- `/web`: Contains the source code for the React frontend.

## Coding Standards

- Always use TypeScript, never use JavaScript.
- Use ES6+ syntax.
- Prefer async/await for asynchronous operations.
- Follow the Prettier code style:
  - Do not add semicolons.
  - Use single quotes for strings.
  - Add trailing commas where valid in ES5 (objects, arrays, etc.)
  - Use 2 spaces for indentation.

## Server

- Use Express.js at the server.
- Organize code into controllers, services and database. For example: UserController, UserService and UserDatabase.
- Follow RESTful API conventions.
- Return appropriate HTTP status codes and error messages.
- Validate all incoming data.
- Store data in PostgreSQL database.
- Use Jest for unit tests.
- Use Supertest for integration tests.

## Web

- Use React at the web.
- Use Valtio for state management.
- Use React Router for navigation.
- Use Chakra UI for styling components.
