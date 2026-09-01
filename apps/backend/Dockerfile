FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS prune

RUN bun install -g turbo
COPY . .
RUN turbo prune @cartepro/backend --docker

FROM base AS build

COPY --from=prune /usr/src/app/out/json/ ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY --from=prune /usr/src/app/out/full/ ./
RUN bun --filter=@cartepro/backend run build

FROM base AS run

COPY --from=build /usr/src/app/node_modules/ ./node_modules/
COPY --from=build /usr/src/app/apps/backend/node_modules/ ./apps/backend/node_modules/
COPY --from=build /usr/src/app/apps/backend/dist/ ./apps/backend/dist/
COPY --from=build /usr/src/app/apps/backend/package.json ./apps/backend/package.json

USER bun
ENV NODE_ENV=production
EXPOSE 3000/tcp
CMD ["bun", "apps/backend/dist/main.js"]
