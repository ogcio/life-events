FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/life-events-admin/package*.json /app/apps/life-events-admin/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/life-events-admin/ /app/apps/life-events-admin/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/


FROM deps AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_LIFE_EVENTS_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_PROTOCOL
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
RUN npm run build --workspace=packages/shared-errors && \
    npm run build --workspace=packages/nextjs-logging-wrapper && \
    npm run build --workspace=apps/life-events-admin

ENV NODE_ENV=production
RUN npm prune --omit=dev

FROM base-deps AS runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/life-events-admin/.next/standalone ./
COPY --from=builder /app/apps/life-events-admin/.next/static ./apps/life-events-admin/.next/static
# TODO: Filter and remove whatever is not necessary for db-migrate and db-migrate-pg
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY --from=deps /app/apps/life-events-admin/database.json /app/apps/life-events-admin/
COPY --from=deps /app/apps/life-events-admin/migrations /app/apps/life-events-admin/migrations

EXPOSE 3010

ENV PORT=3010

CMD [ "node", "apps/life-events-admin/server.js" ]
