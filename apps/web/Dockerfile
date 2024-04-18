FROM base-deps as deps

WORKDIR /app
ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/web/package*.json /app/apps/web/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/
COPY ./packages/building-block-sdk/package*.json /app/packages/building-block-sdk/

RUN npm ci

COPY ./apps/web/ /app/apps/web/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/
COPY ./packages/building-block-sdk/ /app/packages/building-block-sdk/

FROM deps AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_ENDPOINT
ENV NODE_ENV=production
ENV LOG_LEVEL=trace
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT

RUN npm run build --workspace=apps/web

EXPOSE 3000

CMD [ "npm", "--prefix", "apps/web",  "start" ]