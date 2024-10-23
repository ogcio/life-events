FROM base-deps AS deps
WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/intg-api/package*.json /app/apps/intg-api/
COPY ./packages/api-auth/package*.json /app/packages/api-auth/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/

RUN npm ci

COPY ./apps/intg-api/ /app/apps/intg-api/
COPY ./packages/api-auth/ /app/packages/api-auth/

FROM deps AS builder
WORKDIR /app

RUN npm run build --workspace=packages/api-auth && \
    npm run build --workspace=packages/building-blocks-sdk && \
    npm run build --workspace=apps/intg-api

FROM deps AS assembler
COPY --from=builder /app/package*.json /app/

COPY --from=builder /app/apps/intg-api/dist /app/apps/intg-api/dist
COPY --from=builder /app/apps/intg-api/node_modules /app/apps/intg-api/node_modules
COPY --from=builder /app/apps/intg-api/package*.json /app/apps/intg-api/

COPY --from=builder /app/packages/api-auth/dist /app/packages/api-auth/dist
COPY --from=builder /app/packages/api-auth/node_modules /app/packages/api-auth/node_modules
COPY --from=builder /app/packages/api-auth/package.json /app/packages/api-auth/

COPY --from=builder /app/packages/building-blocks-sdk/dist /app/packages/building-blocks-sdk/dist
COPY --from=builder /app/packages/building-blocks-sdk/node_modules /app/packages/building-blocks-sdk/node_modules
COPY --from=builder /app/packages/building-blocks-sdk/package.json /app/packages/building-blocks-sdk/

RUN npm prune --omit=dev

FROM deps AS runner

COPY --from=assembler /app /app
WORKDIR /app/apps/intg-api

ENV NODE_ENV=production
ENV LOG_LEVEL=trace
EXPOSE 8009
CMD [ "npx", "ts-node", "dist/", "index.js" ]
