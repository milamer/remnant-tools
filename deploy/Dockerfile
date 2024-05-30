# syntax=docker/dockerfile:1

FROM node:18.20-bullseye-slim AS base

ENV NODE_ENV=production

RUN mkdir /app/
WORKDIR /app/

FROM base as deps

ENV HUSKY_SKIP_INSTALL=1
ENV NODE_ENV=development

COPY package*.json .npmrc  ./
RUN npm ci

# setup production node_modules
FROM base as production-deps

COPY --from=deps /app/node_modules /app/node_modules
COPY package*.json .npmrc  ./
RUN npm prune --omit=dev

# build app
FROM base as build

COPY --from=deps /app/node_modules /app/node_modules

# app code changes all the time
COPY . .
RUN npm run build

# build smaller image for running
FROM base

ENV PORT=3000
EXPOSE 3000

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

COPY package*.json .npmrc ./

CMD ["npm", "start"]
