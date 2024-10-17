FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/profile-api/ /app/apps/profile-api/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci

WORKDIR /app/packages/api-auth/
RUN npm run build

WORKDIR /app/packages/api-auth/
RUN npm run build

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8003

CMD [ "npm", "--prefix", "apps/profile-api",  "run", "dev" ]