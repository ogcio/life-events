GREEN=\033[0;32m
NC=\033[0m

## Prepare ##
prepare:
	(command -v husky && husky) || true
install-concurrently:
	npm i -g concurrently
npm-install:
	npm i

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
build-sdk: 
	npm run build --workspace=building-blocks-sdk
build-packages: build-shared-errors build-logging-wrapper build-error-handler build-api-auth build-sdk
init-packages: npm-install build-packages

## Docker ##
build-docker:
	docker build -t base-deps:latest  --file Dockerfile . 
	docker build -t design-system-container:latest --file packages/design-system/Dockerfile .
init: init-packages init-env init-ds build-docker
start-docker: 
	docker compose down && \
	DOCKER_BUILDKIT=1 docker compose up --build --remove-orphans -d --wait
start-docker-no-scheduler: 
	docker compose -f docker-compose-no-scheduler.yaml down && \
	DOCKER_BUILDKIT=1 docker compose -f docker-compose-no-scheduler.yaml up --build --remove-orphans -d --wait
reset-docker:
	docker compose down && \
	docker system prune -a -f && \
	docker builder prune -f && \
	docker image prune -f

## Migrations
migrate:
	npm run migrate --workspace=web && \
	npm run migrate --workspace=payments && \
	npm run migrate --workspace=messages && \
	npm run migrate --workspace=profile && \
	npm run migrate --workspace=scheduler && \
	npm run migrate --workspace=upload-api 

## Logto ##
init-logto:
	node scripts/init-logto.mjs
stop-logto:
	node scripts/stop-logto.mjs

## Run services ##
start-docs:
	cd documentation && \
	npm run start && \
	cd ..
run-services:
	concurrently --kill-others-on-fail \
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
	"npm run dev --workspace=forms" \
	"npm run dev --workspace=upload" \
	"npm run dev --workspace=upload-api"
start-services: install-concurrently run-services
	
kill-services:
	sleep 2 && lsof -ti:8000,8001,8002,8003,8004,3000,3001,3002,3003,3004,3005,3006 | xargs sudo kill -9
kill-logto:
	sleep 2 && lsof -ti:3301,3302 | xargs sudo kill -9
kill-all: install-concurrently concurrently kill-services kill-logto
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
start: init start-docker start-migrate
start-no-scheduler: init start-docker-no-scheduler start-migrate kill-services
start-full: init start-docker start-migrate-logto
start-logto: init start-docker-no-scheduler start-migrate-logto

security-privacy-report: 
	docker run --rm -v $(shell pwd):/tmp/scan bearer/bearer:latest scan --report privacy -f html /tmp/scan > bearer-privacy-report.html
security-scan: 
	docker run --rm -v $(shell pwd):/tmp/scan bearer/bearer:latest scan -f html /tmp/scan > bearer-scan-report.html

