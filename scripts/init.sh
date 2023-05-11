docker pull node:20.1-alpine3.17

docker pull nginx:1.23.4-alpine

docker pull postgres:15.2-alpine3.17

docker image build -f dockerfiles/Dockerfile.node -t custom-node:latest dockerfiles

docker volume create pg_app_data

docker compose up -d db

yarn

yarn workspace app_prisma local

yarn workspace session build

docker compose up -d

