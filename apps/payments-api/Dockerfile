FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/payments-api/package*.json /app/apps/payments-api/
COPY ./packages/api-auth/package*.json /app/packages/api-auth/

RUN npm ci

COPY ./apps/payments-api/ /app/apps/payments-api/
COPY ./packages/api-auth/ /app/packages/api-auth/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8001

CMD [ "npm", "--prefix", "apps/payments-api",  "run", "dev" ]