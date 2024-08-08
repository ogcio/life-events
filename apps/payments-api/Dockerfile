FROM base-deps AS deps
WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/payments-api/package*.json /app/apps/payments-api/
COPY ./packages/api-auth/package*.json /app/packages/api-auth/
COPY ./packages/logging-wrapper/package*.json /app/packages/logging-wrapper/
COPY ./packages/error-handler/package*.json /app/packages/error-handler/
COPY ./packages/shared-errors/package*.json /app/packages/shared-errors/

RUN npm ci

COPY ./apps/payments-api/ /app/apps/payments-api/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
COPY ./packages/api-auth/ /app/packages/api-auth/
COPY ./packages/shared-errors/ /app/packages/shared-errors/

FROM deps AS builder
WORKDIR /app

RUN npm run build --workspace=packages/shared-errors && \
    npm run build --workspace=packages/logging-wrapper && \
    npm run build --workspace=packages/error-handler && \
    npm run build --workspace=packages/api-auth && \
    npm run build --workspace=apps/payments-api

FROM deps AS assembler
COPY --from=builder /app/package*.json /app/

COPY --from=builder /app/apps/payments-api/dist /app/apps/payments-api/dist
COPY --from=builder /app/apps/payments-api/node_modules /app/apps/payments-api/node_modules
COPY --from=builder /app/apps/payments-api/package*.json /app/apps/payments-api/

COPY --from=builder /app/packages/shared-errors/dist /app/packages/shared-errors/dist
COPY --from=builder /app/packages/shared-errors/node_modules /app/packages/shared-errors/node_modules
COPY --from=builder /app/packages/shared-errors/package.json /app/packages/shared-errors/

COPY --from=builder /app/packages/logging-wrapper/dist /app/packages/logging-wrapper/dist
COPY --from=builder /app/packages/logging-wrapper/node_modules /app/packages/logging-wrapper/node_modules
COPY --from=builder /app/packages/logging-wrapper/package.json /app/packages/logging-wrapper/

COPY --from=builder /app/packages/error-handler/dist /app/packages/error-handler/dist
COPY --from=builder /app/packages/error-handler/node_modules /app/packages/error-handler/node_modules
COPY --from=builder /app/packages/error-handler/package.json /app/packages/error-handler/

COPY --from=builder /app/packages/api-auth/dist /app/packages/api-auth/dist
COPY --from=builder /app/packages/api-auth/node_modules /app/packages/api-auth/node_modules
COPY --from=builder /app/packages/api-auth/package.json /app/packages/api-auth/

RUN npm prune --omit=dev

FROM deps AS runner

COPY --from=assembler /app /app
WORKDIR /app/apps/payments-api

ENV NODE_ENV=production
ENV LOG_LEVEL=trace
EXPOSE 8001
CMD [ "npx", "ts-node", "dist/", "index.js" ]
