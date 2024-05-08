FROM base-deps as deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/profile/package*.json /app/apps/profile/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/

RUN npm ci

COPY ./apps/profile/ /app/apps/profile/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/

FROM deps AS builder
WORKDIR /app

RUN npm run build --workspace=auth

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=apps/profile

from base-deps as runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/profile/.next/standalone ./
COPY --from=builder /app/apps/profile/.next/static ./apps/profile/.next/static

EXPOSE 3003

CMD [ "node", "apps/profile/server.js" ]