FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/profile/package*.json /app/apps/profile/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/package*.json /app/packages/shared-components/
COPY ./packages/shared-errors/package*.json /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/profile/ /app/apps/profile/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/ /app/packages/shared-components/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/

FROM deps AS builder
WORKDIR /app

ARG NEXT_PUBLIC_PROFILE_SERVICE_ENTRY_POINT

ENV NODE_ENV=production
ENV LOG_LEVEL=trace
ENV NEXT_PUBLIC_PROFILE_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_PROFILE_SERVICE_ENTRY_POINT

RUN npm run build --workspace=packages/shared-errors
RUN npm run build --workspace=packages/nextjs-logging-wrapper
RUN npm run build --workspace=apps/profile

FROM base-deps AS runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/profile/.next/standalone ./
COPY --from=builder /app/apps/profile/.next/static ./apps/profile/.next/static
# TODO: Filter and remove whatever is not necessary for db-migrate and db-migrate-pg
COPY --from=deps /app/node_modules/ /app/node_modules/
COPY --from=deps /app/apps/profile/database.json /app/apps/profile/
COPY --from=deps /app/apps/profile/database-shared.json /app/apps/profile/
COPY --from=deps /app/apps/profile/migrations /app/apps/profile/migrations

EXPOSE 3003

ENV PORT=3003

CMD [ "node", "apps/profile/server.js" ]