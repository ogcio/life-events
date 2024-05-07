FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/timeline-api/ /app/apps/timeline-api/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
RUN npm ci

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8004

CMD [ "npm", "--prefix", "apps/timeline-api",  "run", "dev" ]