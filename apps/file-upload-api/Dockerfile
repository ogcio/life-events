FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/file-upload-api/ /app/apps/file-upload-api/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
RUN npm ci

FROM deps AS builder

WORKDIR /app/packages/shared-errors/
RUN npm run build

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

WORKDIR /app/apps/file-upload-api/
RUN npm run build

FROM base-deps AS runner
WORKDIR /app


COPY --from=builder /app/package*.json /app/

COPY --from=builder /app/apps/file-upload-api/dist /app/apps/file-upload-api/dist
COPY --from=builder /app/apps/file-upload-api/node_modules /app/apps/file-upload-api/node_modules
COPY --from=builder /app/apps/file-upload-api/package*.json /app/apps/file-upload-api/

COPY --from=builder /app/packages/shared-errors/dist /app/packages/shared-errors/dist
COPY --from=builder /app/packages/shared-errors/node_modules /app/packages/shared-errors/node_modules
COPY --from=builder /app/packages/shared-errors/package.json /app/packages/shared-errors/

COPY --from=builder /app/packages/logging-wrapper/dist /app/packages/logging-wrapper/dist
COPY --from=builder /app/packages/logging-wrapper/node_modules /app/packages/logging-wrapper/node_modules
COPY --from=builder /app/packages/logging-wrapper/package.json /app/packages/logging-wrapper/

COPY --from=builder /app/packages/error-handler/dist /app/packages/error-handler/dist
COPY --from=builder /app/packages/error-handler/node_modules /app/packages/error-handler/node_modules
COPY --from=builder /app/packages/error-handler/package.json /app/packages/error-handler/


ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm prune --omit=dev


EXPOSE 8006

WORKDIR /app/apps/file-upload-api

CMD [ "node", "dist/", "index.js" ]