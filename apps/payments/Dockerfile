FROM base-deps as deps

WORKDIR /app
ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/payments/package*.json /app/apps/payments/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/

RUN npm ci

COPY ./apps/payments/ /app/apps/payments/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/

FROM deps AS builder
WORKDIR /app
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NODE_ENV=production
ENV LOG_LEVEL=trace
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_HOST_URL=$NEXT_PUBLIC_HOST_URL

RUN npm run build --workspace=apps/payments

EXPOSE 3001

CMD [ "npm", "--prefix", "apps/payments",  "start" ]
