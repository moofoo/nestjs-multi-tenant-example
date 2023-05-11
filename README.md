# nestjs-multi-tenant-example

## Initial Setup

(make sure ports 5432 and 80 are free)

```console
	yarn && bash scripts/init.sh
```

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

```POSTGRESQL
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

```POSTGRESQL
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

```POSTGRESQL
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

##### User1

Their own User and Tenant rows, and 'John Doe' in the Patients table

##### User2

Their User/Tenant rows, and 'Jane Doe' in the Patients table

Since all queries by the Admin user have bypass = 1 by default, that user ought to see all rows in every table

## NGINX Reverse-Proxy

The NGINX reverse-proxy configuration is minimal. It's main job is to route requests where the pathname begins with `/nest` to the NestJS server, and otherwise send requests to the NextJS Webserver:

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

## Prisma Implementation

#### tenancy.ts

```dirtree
- /apps/backend/src
	- / prisma-tenancy
	    - prisma-tenancy.module.ts
	    - prisma-tenancy.service.ts
	    - /client-extensions
		    - bypass.ts
	        - tenancy.ts V********V
```

```typescript
import {PrismaModule, PrismaService} from "nestjs-prisma";
import {ClsService} from "nestjs-cls";

const useFactory = (prisma: PrismaService, store: ClsService) => {
  console.log("Tenancy Client useFactory called");

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({args, query}) {
          const session = store.get("session");
          const {tenantId, isAdmin} = session;

          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('tenancy.tenant_id', ${`${
              tenantId || 0
            }`}, TRUE), set_config('tenancy.bypass', ${`${
              isAdmin ? 1 : 0
            }`}, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    },
  });
};

export type ExtendedTenantClient = ReturnType<typeof useFactory>;

export const TENANCY_CLIENT_TOKEN = Symbol("TENANCY_CLIENT_TOKEN");

export const PrismaTenancyClientProvider = {
  provide: TENANCY_CLIENT_TOKEN,
  imports: [PrismaModule],
  inject: [PrismaService, ClsService],
  useFactory,
};
```

[Prisma Client extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions)

[Query Component](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions/query)

[Prisma - Transactions and batch queries](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

[Prisma - Raw database access](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw)

[Postgresql - System Administration Functions (set_config)](https://www.postgresql.org/docs/8.0/functions-admin.html)

```typescript
return prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({args, query}) {
        const session = store.get("session");
        const {tenantId, isAdmin} = session;

        const [, result] = await prisma.$transaction([
          prisma.$executeRaw`SELECT set_config('tenancy.tenant_id', ${`${
            tenantId || 0
          }`}, TRUE), set_config('tenancy.bypass', ${`${
            isAdmin ? 1 : 0
          }`}, TRUE)`,
          query(args),
        ]);
        return result;
      },
    },
  },
});
```

[TypeScript: Documentation - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)

```typescript
export type ExtendedTenantClient = ReturnType<typeof useFactory>;
```

[Symbol - Javascript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

```typescript
export const TENANCY_CLIENT_TOKEN = Symbol("TENANCY_CLIENT_TOKEN");
```

[NestJS - Custom Factory Provider](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)

```typescript
export const PrismaTenancyClientProvider = {
  provide: TENANCY_CLIENT_TOKEN,
  imports: [PrismaModule],
  inject: [PrismaService, ClsService],
  useFactory,
};
```

bypass.ts is identical to tenancy.ts, except the set_config call for `tenancy.bypass` always sets it to '1', regardless the value of `isAdmin`:

```typescript
set_config("tenancy.bypass", "1", TRUE);
```

---

### prisma-tenancy.service.ts

(just a helper service for accessing the tenancy and bypass providers.)

```dirtree
- / prisma-tenancy
    - prisma-tenancy.module.ts
    - prisma-tenancy.service.ts V********V
    - / prisma-client
        - prisma.module.ts
        - prisma.service.ts
        - /client-extension-proxies
            - bypass.ts
            - tenancy.ts
```

```typescript
import {Injectable, Inject} from "@nestjs/common";
import {ClsService} from "nestjs-cls";
import {
  BYPASS_CLIENT_TOKEN,
  TENANCY_CLIENT_TOKEN,
  ExtendedTenantClient,
  ExtendedBypassClient,
} from "./client-extensions";
import {SessionUser} from "types";

@Injectable()
export class PrismaTenancyService {
  constructor(
    @Inject(TENANCY_CLIENT_TOKEN)
    private readonly tenantService: ExtendedTenantClient,
    @Inject(BYPASS_CLIENT_TOKEN)
    private readonly bypassService: ExtendedBypassClient,
    private readonly store: ClsService
  ) {
    console.log("PrismaTenancyService constructer executed");
  }
  get tenancy() {
    return this.tenantService;
  }

  get bypass() {
    return this.bypassService;
  }

  switch(bypass: boolean | SessionUser | "session") {
    const session = this.store.get("session");

    if (typeof bypass === "object" && bypass?.isAdmin === true) {
      return this.bypassService;
    } else if (bypass === "session" && session?.isAdmin === true) {
      return this.bypassService;
    } else if (bypass === true) {
      return this.bypassService;
    }

    return this.tenantService;
  }
}
```

---

### prisma-tenancy.module.ts

```dirtree
- / prisma-tenancy
    - prisma-tenancy.module.ts V********V
    - prisma-tenancy.service.ts
    - / prisma-client
        - prisma.module.ts
        - prisma.service.ts
        - /client-extension-proxies
            - bypass.ts
            - tenancy.ts
```

```typescript
import {Module, Global} from "@nestjs/common";
import {
  PrismaBypassClientProvider,
  PrismaTenancyClientProvider,
} from "./prisma-client";
import {PrismaTenancyService} from "./prisma-tenancy.service";
import {ClsModule} from "nestjs-cls";
import {PrismaModule} from "./prisma-client";

@Module({
  imports: [PrismaModule, ClsModule],
  providers: [PrismaBypassClientProvider, PrismaTenancyClientProvider],
  exports: [PrismaTenancyService],
})
export class PrismaTenancyModule {}
```
