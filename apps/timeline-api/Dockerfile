FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/timeline-api/package*.json /app/apps/timeline-api/

RUN npm ci

COPY ./apps/timeline-api/ /app/apps/timeline-api/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8004

CMD [ "npm", "--prefix", "apps/timeline-api",  "run", "dev" ]