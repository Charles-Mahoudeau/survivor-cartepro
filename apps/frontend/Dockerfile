FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS prune

RUN bun install -g turbo
COPY . .
RUN turbo prune @cartepro/frontend --docker

FROM base AS build

COPY --from=prune /usr/src/app/out/json/ ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY --from=prune /usr/src/app/out/full/ ./
RUN bun --filter=@cartepro/frontend run build

FROM base AS run

COPY --from=build /usr/src/app/apps/frontend/.next/standalone ./
COPY --from=build /usr/src/app/apps/frontend/public ./apps/frontend/public/
COPY --from=build /usr/src/app/apps/frontend/.next/static ./apps/frontend/.next/static/

USER bun
ENV NODE_ENV=production
EXPOSE 3000/tcp
CMD ["bun", "apps/frontend/server.js"]
