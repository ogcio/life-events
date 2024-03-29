FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/payments-backend/package*.json /app/apps/payments-backend/

RUN npm ci

COPY ./apps/payments-backend/ /app/apps/payments-backend/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8001

CMD [ "npm", "--prefix", "apps/payments-backend",  "run", "dev" ]