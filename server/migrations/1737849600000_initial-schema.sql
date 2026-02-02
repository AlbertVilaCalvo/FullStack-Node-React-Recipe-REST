-- Up Migration: Create initial schema

-- https://github.com/bryanrichie/reddit-clone-old/blob/main/packages/server/schema.sql
-- https://github.com/iqbal125/react-hooks-admin-app-fullstack/blob/master/Server/main/schema.sql
-- See 'CREATE DOMAIN email AS citext CHECK' https://github.dev/kriasoft/node-starter-kit/blob/main/migrations/001_initial.js

CREATE TABLE "user"
(
    id             SERIAL PRIMARY KEY,
    email          VARCHAR(254) NOT NULL UNIQUE,
    password       CHAR(60)     NOT NULL,
    name           VARCHAR(255) NOT NULL,
    email_verified BOOLEAN      NOT NULL DEFAULT false
);

CREATE TABLE recipe
(
    id                   SERIAL PRIMARY KEY,
    user_id              INTEGER      NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    title                VARCHAR(255) NOT NULL,
    cooking_time_minutes INT          NOT NULL
        CHECK (
            cooking_time_minutes > 0 AND
            cooking_time_minutes <= 4320 -- 3 days (3 * 24 * 60)
        )
);

---- Down Migration

DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS "user";
