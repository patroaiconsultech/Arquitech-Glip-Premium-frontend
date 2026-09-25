FROM node:20.20.2-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then       npm ci --no-audit --no-fund;     else       echo "WARNING: package-lock.json missing; staging bootstrap install";       npm install --no-audit --no-fund;     fi
COPY . .
COPY env.example ./.env.example
RUN npm test
RUN npm run build

FROM node:20.20.2-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=build /app/dist ./dist
COPY server.mjs ./
EXPOSE 8080
CMD ["node","server.mjs"]
