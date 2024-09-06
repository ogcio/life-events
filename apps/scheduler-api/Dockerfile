FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/scheduler-api/ /app/apps/scheduler-api/
COPY ./apps/scheduler-api/db /app/apps/scheduler-api/db
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/

RUN npm ci

FROM deps AS builder

RUN npm run build -w=/app/packages/shared-errors && \
    npm run build -w=/app/packages/logging-wrapper && \
    npm run build -w=/app/packages/error-handler && \
    npm run build -w=/app/apps/scheduler-api

FROM base-deps AS assembler
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/apps/scheduler-api/dist /app/apps/scheduler-api/dist
COPY --from=builder /app/apps/scheduler-api/package*.json /app/apps/scheduler-api/

COPY --from=builder /app/packages/shared-errors/dist /app/packages/shared-errors/dist
COPY --from=builder /app/packages/shared-errors/node_modules /app/packages/shared-errors/node_modules
COPY --from=builder /app/packages/shared-errors/package.json /app/packages/shared-errors/

COPY --from=builder /app/packages/logging-wrapper/dist /app/packages/logging-wrapper/dist
COPY --from=builder /app/packages/logging-wrapper/node_modules /app/packages/logging-wrapper/node_modules
COPY --from=builder /app/packages/logging-wrapper/package.json /app/packages/logging-wrapper/

COPY --from=builder /app/packages/error-handler/dist /app/packages/error-handler/dist
COPY --from=builder /app/packages/error-handler/package.json /app/packages/error-handler/

RUN npm prune --omit=dev

FROM base-deps AS runner

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=assembler /app /app
COPY --from=deps /app/apps/scheduler-api/db /app/apps/scheduler-api/db

EXPOSE 8005

WORKDIR /app/apps/scheduler-api

CMD [ "node", "dist/", "index.js" ]