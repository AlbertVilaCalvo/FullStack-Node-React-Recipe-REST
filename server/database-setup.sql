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
        check (
                    cooking_time_minutes > 0 and
                    cooking_time_minutes <= 4320 -- 3 days (3 * 24 * 60)
            )
);

CREATE TABLE auth
(
    auth_token VARCHAR(255) NOT NULL,
    user_id    INTEGER      NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
--     expires_at
);
