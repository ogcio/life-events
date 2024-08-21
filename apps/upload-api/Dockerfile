FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/upload-api/ /app/apps/upload-api/
COPY ./apps/upload-api/db /app/apps/upload-api/db
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci

FROM deps AS builder


RUN npm run build -w=/app/packages/shared-errors && \
    npm run build -w=/app/packages/logging-wrapper && \
    npm run build -w=/app/packages/error-handler && \
    npm run build -w=/app/packages/building-blocks-sdk && \
    npm run build -w=/app/packages/api-auth && \
    npm run build -w=/app/apps/upload-api


FROM base-deps AS assembler
WORKDIR /app


ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/apps/upload-api/dist /app/apps/upload-api/dist
COPY --from=builder /app/apps/upload-api/node_modules /app/apps/upload-api/node_modules
COPY --from=builder /app/apps/upload-api/package*.json /app/apps/upload-api/

COPY --from=builder /app/packages/shared-errors/dist /app/packages/shared-errors/dist
COPY --from=builder /app/packages/shared-errors/node_modules /app/packages/shared-errors/node_modules
COPY --from=builder /app/packages/shared-errors/package.json /app/packages/shared-errors/

COPY --from=builder /app/packages/logging-wrapper/dist /app/packages/logging-wrapper/dist
COPY --from=builder /app/packages/logging-wrapper/node_modules /app/packages/logging-wrapper/node_modules
COPY --from=builder /app/packages/logging-wrapper/package.json /app/packages/logging-wrapper/

COPY --from=builder /app/packages/error-handler/dist /app/packages/error-handler/dist
COPY --from=builder /app/packages/error-handler/node_modules /app/packages/error-handler/node_modules
COPY --from=builder /app/packages/error-handler/package.json /app/packages/error-handler/

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
COPY --from=deps /app/apps/upload-api/db /app/apps/upload-api/db

EXPOSE 8007

WORKDIR /app/apps/upload-api

CMD [ "node", "dist/", "index.js" ]
