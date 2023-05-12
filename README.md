# nestjs-multi-tenant-example

## Initial Setup

(make sure ports 5432 and 80 are free and docker is running)

```console
bash scripts/init.sh
```

App should then be accessible at http://localhost.

You can log in to the app using one of the following usernames / passwords:

- user1:user1
- user2:user2
- admin:admin

Once logged in you will see data from the 'Patients' table, which will be filtered as per the RLS (row level security) Postgres function.

You can also see Prisma Metrics json output at http://localhost/nest/stats

## Database Overview

Here is the database service definition from docker-compose.yml:

```YAML
  db:
    <<: *defaults
    image: postgres:15.2-alpine3.17
    ports:
      - '5432:5432'
    volumes:
      - pg_app_data:/var/lib/postgresql/data
      - type: bind
        source: ./db
        target: /docker-entrypoint-initdb.d
    environment:
      POSTGRES_PASSWORD: 07f019e661d8ca48c47bdffd255b12fe
```

The bind mount maps the db directory on the host to the docker entrypoint directory.

The two SQL files in ./db (1_schema.sql and 2_data.sql) are executed when the container is created, creating the schema and populating it with test data.

### [1_schema.sql](https://github.com/moofoo/nestjs-multi-tenant-example/blob/main/db/1_schema.sql)

###### The tables:

```sql
create table if not exists public.tenants
(
    id bigserial primary key,
    display_name varchar,
    is_admin boolean default false
);

create table if not exists public.users
(
    id bigserial primary key,
    tenant_id bigint
        constraint users_tenants_id_fk
            references public.tenants
            on delete cascade,
    user_name varchar,
    password varchar
);

create table if not exists public.patients
(
    id bigserial primary key,
    tenant_id bigint
        constraint patients_tenants_id_fk
            references public.tenants
            on delete cascade,
    first_name varchar,
    last_name varchar,
    dob date
);
```

RLS function:

```sql
create or replace function fn.tenant_data_rls_check(row_tenant_id bigint) returns boolean
    language plpgsql
as
$$
BEGIN

IF current_setting('tenancy.bypass')::text = '1' THEN
    return true;
end if;

IF current_setting('tenancy.tenant_id')::integer = row_tenant_id THEN
    return true;
end if;

return false;
END;
$$;
```

tenant_data_rls_check takes a single argument, the value of 'tenant_id' (or 'id' for the tenants table) for the queried/mutated row.

Looking at the function body, you'll see that first it checks if the session value 'tenancy.bypass' is equal to '1', and if so it returns true, allowing the operation.

Next, it compares the session value 'tenancy.tenant_id' with the tenant_id value for the row. If equal, it allows the operation, otherwise the operation fails.

###### Policies:

```sql
create policy tenancy_policy on public.tenants
    as permissive
    for all
    using (fn.tenant_data_rls_check(id) = true)
    with check (fn.tenant_data_rls_check(id) = true);

create policy tenancy_policy on public.users
    as permissive
    for all
    using (fn.tenant_data_rls_check(tenant_id) = true)
    with check (fn.tenant_data_rls_check(tenant_id) = true);

create policy tenancy_policy on public.patients
    as permissive
    for all
    using (fn.tenant_data_rls_check(tenant_id) = true)
    with check (fn.tenant_data_rls_check(tenant_id) = true);
```

Note that 1_schema.sql enables these policies at the end of the script, so you don't need to do that yourself.

### [2_data.sql](https://github.com/moofoo/nestjs-multi-tenant-example/blob/main/db/2_data.sql)

This SQL file populates the database with the following test data:

## Tenants Test Data

<table border="1" style="border-collapse:collapse">
<tr><th>id</th><th>display_name</th><th>is_admin</th></tr>
<tr><td>1</td><td>user tenant 1</td><td>false</td></tr>
<tr><td>2</td><td>user tenant 2</td><td>false</td></tr>
<tr><td>3</td><td>admin tenant</td><td>true</td></tr>
</table>

## Users Test Data

<table border="1" style="border-collapse:collapse">
<tr><th>id</th><th>tenant_id</th><th>user_name</th><th>password</th></tr>
<tr><td>1</td><td>1</td><td>user1</td><td>$2b$10$zrWh.kGsBsGHy4DcPcgS4eczXTVGEJMnXTzenLRzHLvFqbhAtnHOq</td></tr>
<tr><td>2</td><td>2</td><td>user2</td><td>$2b$10$iUK2psZixdzgnBNn/AuQLuw88487vJjY9H.LWilyS9ege1KFNq.6a</td></tr>
<tr><td>3</td><td>3</td><td>admin</td><td>$2b$10$FqEkMpnM0pZgcQWYoUG70ONWtZCgmCIVH4SQqW9VtIcV9mbUXVSdS</td></tr>
</table>

## Patients Test Data

<table border="1" style="border-collapse:collapse">
<tr><th>id</th><th>tenant_id</th><th>first_name</th><th>last_name</th><th>dob</th></tr>
<tr><td>1 (user1)</td><td>1</td><td>John</td><td>Doe</td><td>1984-02-11</td></tr>
<tr><td>2 (user2)</td><td>2</td><td>Jane</td><td>Doe</td><td>1992-05-13</td></tr>
</table>

With RLS active and functioning correctly, the two non-admin users should only see a subset of rows for each table:

### User1

Their own User and Tenant rows, and 'John Doe' in the Patients table

### User2

Their User/Tenant rows, and 'Jane Doe' in the Patients table

### Admin

Ought to see all rows in every table

## NGINX Reverse-Proxy

Here is the proxy definition from docker-compose.yml:

```yaml
  proxy:
    <<: *defaults
    image: nginx:1.23.4-alpine
    depends_on:
      - frontend
      - backend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/proxy.conf:/etc/nginx/proxy.conf
      - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
```

[nginx config directory](https://github.com/moofoo/nestjs-multi-tenant-example/blob/main/nginx)

The NGINX config is minimal. The reverse-proxy routes pathnames that begin with `/nest` to the NestJS server, otherwise it sends requests to the NextJS frontend.

### [default.conf](https://github.com/moofoo/nestjs-multi-tenant-example/blob/main/nginx/conf.d/default.conf)

```Nginx
upstream nextjs_upstream {
    server frontend:3000;
}

upstream nestjs_upstream {
    server backend:3333;
}

server {
        listen 80 reuseport default_server;
        listen [::]:80 reuseport default_server;

        gzip on;
        gzip_proxied any;
        gzip_comp_level 4;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

        location /nest {
            include /etc/nginx/proxy.conf;
            proxy_pass http://nestjs_upstream;
        }

        location / {
            include /etc/nginx/proxy.conf;
            proxy_pass http://nextjs_upstream;
        }
}
```

## Authentication and Session Handling

The app uses [Iron Session](https://github.com/vvo/iron-session) for the encrypted session store (cookie storage). Since both the frontend and backend use the same [config](https://github.com/moofoo/nestjs-multi-tenant-example/tree/main/packages/session/src/index.ts), both are able to read and modify the session. Access control on the frontend is handled by [middleware](https://github.com/moofoo/nestjs-multi-tenant-example/tree/main/apps/frontend/src/middleware.ts). Here is the [login method](https://github.com/moofoo/nestjs-multi-tenant-example/tree/main/apps/backend/src/auth/auth.service.ts)

Please be aware that this is a "toy" app meant to demonstrate the given programming concepts/techniques. It does **NOT** implement security best-practices.

## Frontend

The frontend is a [NextJS](https://nextjs.org/) app using [Mantine](https://mantine.dev) for the UI.

## Prisma Implementation

Check out the [prisma-tenancy directory](https://github.com/moofoo/nestjs-multi-tenant-example/tree/main/apps/backend/src/prisma-tenancy) in `apps/backend/src`
