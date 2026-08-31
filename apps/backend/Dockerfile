FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS install

# Install backend dependencies into temp directory
# This will cache them and speed up future builds
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY apps/backend/package.json  /temp/dev/apps/backend/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install backend with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY apps/backend/package.json /temp/prod/apps/backend/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease

# Copy node_modules from temp directory
COPY --from=install /temp/dev/node_modules node_modules

# Copy all (non-ignored) project files into the image
COPY . .

# Build
ENV NODE_ENV=production
RUN bun run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules/ node_modules/
COPY --from=install /temp/prod/apps/backend/node_modules/ apps/backend/node_modules/
COPY --from=prerelease /usr/src/app/apps/backend/dist/main.js apps/backend/dist/main.js
COPY --from=prerelease /usr/src/app/package.json package.json

# run the app
USER bun
ENV NODE_ENV=production
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "apps/backend/dist/main.js" ]
