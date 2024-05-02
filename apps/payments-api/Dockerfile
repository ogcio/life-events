FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/payments-api/package*.json /app/apps/payments-api/
COPY ./packages/logging-wrapper/package*.json /app/packages/logging-wrapper/
COPY ./packages/error-handler/package*.json /app/packages/error-handler/


RUN npm ci

COPY ./apps/payments-api/ /app/apps/payments-api/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8001

CMD [ "npm", "--prefix", "apps/payments-api",  "run", "dev" ]