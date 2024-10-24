FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/integrator/package*.json /app/apps/integrator/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/package*.json /app/packages/shared-components/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/integrator/ /app/apps/integrator/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/ /app/packages/shared-components/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/

FROM deps AS builder

WORKDIR /app

ARG NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT

ENV NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT

RUN npm run build --workspace=packages/nextjs-logging-wrapper && \
    npm run build --workspace=packages/building-blocks-sdk && \
    npm run build --workspace=apps/integrator

FROM base-deps AS runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/integrator/.next/standalone ./
COPY --from=builder /app/apps/integrator/.next/static ./apps/integrator/.next/static
COPY --from=deps /app/node_modules/ /app/node_modules/
COPY --from=deps /app/apps/integrator/database.json /app/apps/integrator/
COPY --from=deps /app/apps/integrator/migrations /app/apps/integrator/migrations

EXPOSE 3009

ENV PORT=3009

CMD [ "node", "apps/integrator/server.js" ]