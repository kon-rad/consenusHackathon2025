FROM node:23-alpine AS builder
USER node
WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/home/node/.npm,id=npm_cache,uid=1000,gid=1000,sharing=locked \
       npm ci --cache /home/node/.npm --prefer-offline --legacy-peer-deps

COPY --chown=node:node . .
RUN set -x & ls -la
RUN npm run build


FROM node:22-alpine
USER node
WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/home/node/.npm,id=npm_cache,uid=1000,gid=1000,sharing=locked \
       npm ci --cache /home/node/.npm --prefer-offline --legacy-peer-deps --omit=dev

COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]

