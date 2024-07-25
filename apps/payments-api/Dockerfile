FROM base-deps AS deps
WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/payments-api/ /app/apps/payments-api/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci

WORKDIR /app/packages/shared-errors/
RUN npm run build

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

WORKDIR /app/packages/api-auth/
RUN npm run build

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace
EXPOSE 8001
CMD [ "npm", "--prefix", "apps/payments-api",  "run", "start" ]
