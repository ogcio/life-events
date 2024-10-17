FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/auth-service/ /app/apps/auth-service/
RUN npm ci

FROM deps AS builder

WORKDIR /app/apps/auth-service/
RUN npm run build

FROM base-deps AS runner
WORKDIR /app


COPY --from=builder /app/package*.json /app/

COPY --from=builder /app/apps/auth-service/dist /app/apps/auth-service/dist
COPY --from=builder /app/apps/auth-service/package*.json /app/apps/auth-service/

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm prune --omit=dev


EXPOSE 3005

WORKDIR /app/apps/auth-service

CMD [ "node", "dist/", "index.js" ]