import { Injectable, Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { BYPASS_CLIENT_TOKEN, TENANCY_CLIENT_TOKEN, ExtendedTenantClient, ExtendedBypassClient } from './client-extensions';
import { SessionUser } from 'types';

@Injectable()
export class PrismaTenancyService {
    constructor(@Inject(TENANCY_CLIENT_TOKEN) private readonly tenantService: ExtendedTenantClient, @Inject(BYPASS_CLIENT_TOKEN) private readonly bypassService: ExtendedBypassClient, private readonly store: ClsService) {
        console.log("PrismaTenancyService constructer executed");
    }
    get tenancy() {
        return this.tenantService;
    }

    get bypass() {
        return this.bypassService;
    }

    public switch(bypass?: boolean) {
        return bypass ? this.bypassService : this.tenantService;
    }
}