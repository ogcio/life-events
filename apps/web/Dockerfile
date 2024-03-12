FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/web/package*.json /app/apps/web/
COPY ./packages/design-system/package*.json /app/packages/design-system/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/

RUN npm ci

COPY ./apps/web/ /app/apps/web/
COPY ./packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/

# hack for some reason deps aren't being installed properly
RUN npm i @rollup/rollup-linux-x64-musl
RUN npm run build --workspace=packages/design-system

EXPOSE 80

CMD [ "npm", "--prefix", "apps/web",  "run", "dev" ]