FROM base-deps as deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/home/package*.json /app/apps/home/

RUN npm ci

COPY ./apps/home/ /app/apps/home/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/

FROM deps AS builder
WORKDIR /app

RUN npm run build --workspace=auth

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=apps/home

FROM base-deps as runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/home/.next/standalone ./
COPY --from=builder /app/apps/home/.next/static ./apps/home/.next/static
COPY --from=deps /app/node_modules/ /app/node_modules/

EXPOSE 3004

ENV PORT 3004

CMD [ "node", "apps/home/server.js" ]
