FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/mock-api/package*.json /app/apps/mock-api/

RUN npm ci

COPY ./apps/mock-api/ /app/apps/mock-api/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8000

CMD [ "npm", "--prefix", "apps/mock-api",  "run", "dev" ]