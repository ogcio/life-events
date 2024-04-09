FROM base-deps as deps

WORKDIR /app
ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/profile/package*.json /app/apps/profile/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/

RUN npm ci

COPY ./apps/profile/ /app/apps/profile/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/

FROM deps AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=apps/profile

EXPOSE 3003

CMD [ "npm", "--prefix", "apps/profile",  "start" ]