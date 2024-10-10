FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/timeline-api/ /app/apps/timeline-api/
RUN npm ci

FROM deps AS builder

WORKDIR /app/apps/timeline-api/
RUN npm run build

FROM base-deps AS runner
WORKDIR /app


COPY --from=builder /app/package*.json /app/

COPY --from=builder /app/apps/timeline-api/dist /app/apps/timeline-api/dist
COPY --from=builder /app/apps/timeline-api/package*.json /app/apps/timeline-api/

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm prune --omit=dev


EXPOSE 8004

WORKDIR /app/apps/timeline-api

CMD [ "node", "dist/", "index.js" ]