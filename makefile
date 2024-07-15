GREEN=\033[0;32m
NC=\033[0m

## env files ##
update-env:
		MODE=update node scripts/init-env.mjs
init-env:
		node scripts/init-env.mjs

## Build packages ##
build-ds:
	npm run build --workspace=design-system
init-ds:
	@if [ ! -d "packages/design-system/dist" ]; then\
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

## Migrations

migrate-web: 
	npm run migrate --workspace=web
migrate-payments: 
	npm run migrate --workspace=payments
migrate-messaging:
	npm run migrate --workspace=messages
migrate-profile:
	npm run migrate --workspace=profile
migrate-scheduler-api: 
	npm run migrate --workspace=scheduler
migrate:
	$(MAKE) migrate-web
	$(MAKE) migrate-payments
	$(MAKE) migrate-messaging
	$(MAKE) migrate-profile
	$(MAKE) migrate-scheduler-api