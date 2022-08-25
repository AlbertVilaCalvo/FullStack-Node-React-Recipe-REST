CREATE TABLE recipe
(
    id                   SERIAL PRIMARY KEY,
    title                VARCHAR(255) NOT NULL,
    cooking_time_minutes INT          NOT NULL
        check (
                    cooking_time_minutes > 0 and
                    cooking_time_minutes <= 4320 -- 3 days (3 * 24 * 60)
            )
);

CREATE TABLE "user"
(
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(254) NOT NULL UNIQUE,
    password   CHAR(60)     NOT NULL,
    name       VARCHAR(254) NOT NULL
);
