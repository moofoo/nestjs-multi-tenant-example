import { Injectable } from '@nestjs/common';
import type { Prisma } from 'app-prisma';
import { PrismaTenancyService } from 'prisma-tenancy';

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: PrismaTenancyService) { }

    findUnique(input: Prisma.TenantFindUniqueArgs, bypass = false) {
        return this.prisma.switch(bypass).tenant.findUnique(input);
    }

    findFirst(input: Prisma.TenantFindFirstArgs, bypass = false) {
        return this.prisma.switch(bypass).tenant.findFirst(input);
    }

    findMany(input: Prisma.TenantFindManyArgs, bypass = false) {
        return this.prisma.switch(bypass).tenant.findFirst(input);
    }

    create(input: Prisma.TenantCreateArgs, bypass = false) {
        return this.prisma.switch(bypass).tenant.create(input);
    }

    update(input: Prisma.TenantUpdateArgs, bypass = false) {
        return this.prisma.switch(bypass).tenant.update(input);
    }

    delete(input: Prisma.TenantDeleteArgs, bypass = false) {
        return this.prisma.switch(bypass).tenant.delete(input);
    }
}