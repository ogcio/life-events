FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/scheduler-api/ /app/apps/scheduler-api/
COPY ./apps/scheduler-api/db /app/apps/scheduler-api/db
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci

FROM deps AS builder

RUN npm run build -w=/app/packages/building-blocks-sdk && \
    npm run build -w=/app/packages/api-auth && \
    npm run build -w=/app/apps/scheduler-api

FROM base-deps AS assembler
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/apps/scheduler-api/dist /app/apps/scheduler-api/dist
COPY --from=builder /app/apps/scheduler-api/package*.json /app/apps/scheduler-api/

COPY --from=builder /app/packages/building-blocks-sdk/dist /app/packages/building-blocks-sdk/dist
COPY --from=builder /app/packages/building-blocks-sdk/node_modules /app/packages/building-blocks-sdk/node_modules
COPY --from=builder /app/packages/building-blocks-sdk/package.json /app/packages/building-blocks-sdk/

COPY --from=builder /app/packages/api-auth/dist /app/packages/api-auth/dist
COPY --from=builder /app/packages/api-auth/node_modules /app/packages/api-auth/node_modules
COPY --from=builder /app/packages/api-auth/package.json /app/packages/api-auth/

RUN npm prune --omit=dev

FROM base-deps AS runner

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=assembler /app /app
COPY --from=deps /app/apps/scheduler-api/db /app/apps/scheduler-api/db

EXPOSE 8005

WORKDIR /app/apps/scheduler-api

CMD [ "node", "dist/", "index.js" ]