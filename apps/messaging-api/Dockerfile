FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/messaging-api/ /app/apps/messaging-api/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci 

FROM deps AS builder

WORKDIR /app/packages/shared-errors/
RUN npm run build

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

WORKDIR /app/packages/api-auth/
RUN npm run build

WORKDIR /app/apps/messaging-api/
RUN npm run build

FROM base-deps AS assembler
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/apps/messaging-api/dist /app/apps/messaging-api/dist
COPY --from=builder /app/apps/messaging-api/node_modules /app/apps/messaging-api/node_modules
COPY --from=builder /app/apps/messaging-api/package*.json /app/apps/messaging-api/

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

FROM base-deps AS runner

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=assembler /app /app

EXPOSE 8002

WORKDIR /app/apps/messaging-api

CMD [ "node", "dist/", "index.js" ]