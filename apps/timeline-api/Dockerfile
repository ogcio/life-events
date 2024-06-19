FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/timeline-api/ /app/apps/timeline-api/ 
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
RUN npm ci


FROM deps AS builder

WORKDIR /app/packages/logging-wrapper/
RUN npm ci
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm ci
RUN npm run build

WORKDIR /app/apps/timeline-api/
RUN npm -v
RUN echo "install start"
RUN npm ci
#|| cat /root/.npm/_logs/*-debug-0.log
RUN echo "install done"
RUN echo "build start"
RUN npm run build
RUN echo "build done"

FROM base-deps AS runner
WORKDIR /app


COPY --from=builder /app/package*.json /app/

COPY --from=builder /app/apps/timeline-api/dist /app/apps/timeline-api/dist
COPY --from=builder /app/apps/timeline-api/node_modules /app/apps/timeline-api/node_modules
COPY --from=builder /app/apps/timeline-api/package*.json /app/apps/timeline-api/

COPY --from=builder /app/packages/logging-wrapper/dist /app/packages/logging-wrapper/dist
COPY --from=builder /app/packages/logging-wrapper/node_modules /app/packages/logging-wrapper/node_modules
COPY --from=builder /app/packages/logging-wrapper/package.json /app/packages/logging-wrapper/

COPY --from=builder /app/packages/error-handler/dist /app/packages/error-handler/dist
COPY --from=builder /app/packages/error-handler/node_modules /app/packages/error-handler/node_modules
COPY --from=builder /app/packages/error-handler/package.json /app/packages/error-handler/


ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm prune --omit=dev


EXPOSE 8004

WORKDIR /app/apps/timeline-api

CMD [ "node", "dist/", "index.js" ]