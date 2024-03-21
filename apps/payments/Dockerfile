FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/payments/package*.json /app/apps/payments/
COPY ./packages/design-system/package*.json /app/packages/design-system/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/

RUN npm ci

COPY ./apps/payments/ /app/apps/payments/
COPY ./packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

# hack for some reason deps aren't being installed properly
#RUN npm i @rollup/rollup-linux-x64-musl
RUN npm run build --workspace=packages/design-system
RUN npm run build --workspace=apps/payments

EXPOSE 3001

CMD [ "npm", "--prefix", "apps/payments",  "start" ]
