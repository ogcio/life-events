FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/profile-api/ /app/apps/profile-api/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/

RUN npm ci

WORKDIR /app/packages/shared-errors/
RUN npm run build

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8003

CMD [ "npm", "--prefix", "apps/profile-api",  "run", "dev" ]