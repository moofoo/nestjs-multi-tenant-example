docker compose kill db 
docker compose rm -f db
docker volume rm pg_app_data
docker volume create pg_app_data
docker compose up -d db
sleep 5
docker compose restart