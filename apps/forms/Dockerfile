FROM base-deps as deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/forms/package*.json /app/apps/forms/

RUN npm ci

COPY ./apps/forms/ /app/apps/forms/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=apps/forms

FROM base-deps as runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/forms/.next/standalone ./
COPY --from=builder /app/apps/forms/.next/static ./apps/forms/.next/static
COPY --from=deps /app/node_modules/ /app/node_modules/

EXPOSE 3006

ENV PORT 3006

CMD [ "node", "apps/forms/server.js" ]
