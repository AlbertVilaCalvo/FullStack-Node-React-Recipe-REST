# syntax=docker/dockerfile:1

# ---- Dependencies Stage ----
# Install only production dependencies.
FROM node:24-alpine AS dependencies
WORKDIR /app
ENV NODE_ENV=production

# Install Python and build tools required for native modules like bcrypt.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --only=production --no-fund --no-audit


# ---- Build Stage ----
# Build the TypeScript source code into JavaScript. Requires devDependencies.
FROM node:24-alpine AS build
WORKDIR /app
# NODE_ENV is not set to 'production' in this stage because we need
# to install devDependencies to build the application (we need tsc).

# Install Python and build tools required for native modules like bcrypt.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit

COPY src ./src
COPY tsconfig.json ./
RUN npm run build


# ---- Production Stage ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/build ./build

EXPOSE 5000

CMD ["node", "build/index.js"]
