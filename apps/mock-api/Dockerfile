FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/mock-api/package*.json /app/apps/mock-api/
RUN npm ci

COPY ./apps/mock-api/ /app/apps/mock-api/

EXPOSE 80

CMD [ "npm", "--prefix", "apps/mock-api",  "run", "dev" ]