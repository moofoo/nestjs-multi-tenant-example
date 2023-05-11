import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaTenancyModule } from 'prisma-tenancy';
@Module({
    imports: [PrismaTenancyModule],
    providers: [TenantsService],
    exports: [TenantsService]
})
export class TenantsModule { }
