GREEN=\033[0;32m
NC=\033[0m

## Prepare ##
install-concurrently:
	npm i -g concurrently

## env files ##
update-env:
		MODE=update node scripts/init-env.mjs
init-env:
		node scripts/init-env.mjs

## Build packages ##
build-ds:
	npm run build --workspace=design-system
init-ds:
	@if [ ! -d "packages/design-system/dist" ]; then \
		$(MAKE) build-ds; \
	fi
build-shared-errors:
	npm run build --workspace=shared-errors
build-logging-wrapper: 
	npm run build --workspace=logging-wrapper
	npm run build --workspace=nextjs-logging-wrapper
build-api-auth: 
	npm run build --workspace=api-auth
build-error-handler: 
	npm run build --workspace=error-handler
build-packages: 
	$(MAKE) build-shared-errors
	$(MAKE) build-logging-wrapper
	$(MAKE) build-error-handler
	$(MAKE) build-api-auth
init-packages: 
	npm i
	$(MAKE) build-packages

## Docker ##
build-docker:
	docker build -t base-deps:latest  --file Dockerfile . 
	docker build -t design-system-container:latest --file packages/design-system/Dockerfile .
init:
	$(MAKE) init-packages
	$(MAKE) init-env
	$(MAKE) init-ds
	$(MAKE) build-docker
start-docker: 
	docker-compose down && \
	DOCKER_BUILDKIT=1 docker-compose up --build --remove-orphans -d --wait
start-docker-no-scheduler: 
	docker-compose -f docker-compose-no-scheduler.yaml down && \
	DOCKER_BUILDKIT=1 docker-compose -f docker-compose-no-scheduler.yaml up --build --remove-orphans -d --wait

## Migrations
migrate:
	npm run migrate --workspace=web && \
	npm run migrate --workspace=payments && \
	npm run migrate --workspace=messages && \
	npm run migrate --workspace=profile && \
	npm run migrate --workspace=scheduler

## Logto ##
init-logto:
	node scripts/init-logto.mjs
stop-logto:
	node scripts/stop-logto.mjs

## Run services ##
start-services:
	$(MAKE) install-concurrently && \
	concurrently --kill-others \
	"npm run dev --workspace=auth-service" \
	"npm run dev --workspace=mock-api" \
	"npm run dev --workspace=web" \
	"npm run dev --workspace=payments" \
	"npm run dev --workspace=messaging" \
	"npm run dev --workspace=payments-api" \
	"npm run dev --workspace=profile" \
	"npm run dev --workspace=messaging-api" \
	"npm run dev --workspace=profile-api"  \
	"npm run dev --workspace=timeline-api" \
	"npm run dev --workspace=home" \
	"npm run dev --workspace=forms"
kill-services:
	sudo lsof -ti:8000,8001,8002,8003,8004,3000,3001,3002,3003,3004,3005,3006,3301,3302 | xargs sudo kill -9
start-migrate:
	$(MAKE) install-concurrently && \
	concurrently \
	"$(MAKE) start-services" \
	"sleep 5 && $(MAKE) migrate"
start-migrate-logto:
	$(MAKE) install-concurrently && \
	concurrently \
	"$(MAKE) start-services" \
	"$(MAKE) init-logto" \
	"sleep 5 && $(MAKE) migrate"
start:
	$(MAKE) init && \
	$(MAKE) start-docker && \
	$(MAKE) start-migrate && \
	$(MAKE) kill-services
start-no-scheduler:
	$(MAKE) init && \
	$(MAKE) start-docker-no-scheduler && \
	$(MAKE) start-migrate && \
	$(MAKE) kill-services
start-full:
	$(MAKE) init && \
	$(MAKE) start-docker && \
	$(MAKE) start-migrate-logto && \
	$(MAKE) kill-services
start-logto:
	$(MAKE) init && \
	$(MAKE) start-docker-no-scheduler && \
	$(MAKE) start-migrate-logto && \
	$(MAKE) kill-services
