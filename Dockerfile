# Stage 1: Build
FROM node:20 AS build

# Build Draw App
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/draw/package.json apps/draw/
COPY packages/core/package.json packages/core/
COPY packages/dgmjs-plugin-yjs/package.json packages/dgmjs-plugin-yjs/
COPY packages/export/package.json packages/export/
COPY packages/pdf/package.json packages/pdf/
COPY packages/react/package.json packages/react/


RUN npm install --workspaces

COPY . .

# Get rid of apps we don't need
RUN rm -rf apps/demo apps/docs
RUN npm run build --workspaces 

# Build Standalone Draw Server
WORKDIR /app/draw-server
RUN npm install

# Stage 2: Serve
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/draw-server/ ./
COPY --from=build /app/apps/draw/dist ./dist

RUN echo "DIST_DIR=./dist" > .env

LABEL org.opencontainers.image.source=https://github.com/meatbyte-studio/draw-server

CMD ["npm", "run", "start"]