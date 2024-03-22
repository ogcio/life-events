FROM base-deps as design-system

WORKDIR /app

ENV NODE_ENV=development
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./packages/design-system/package*.json /app/packages/design-system/
RUN npm i

ARG TARGETARCH

RUN if [ "$TARGETARCH" = "arm64" ]; then \
        npm i @rollup/rollup-linux-arm64-musl; \
    else \
        npm i @rollup/rollup-linux-x64-musl; \
    fi

COPY ./packages/design-system/ /app/packages/design-system/

RUN npm run build --workspace=packages/design-system