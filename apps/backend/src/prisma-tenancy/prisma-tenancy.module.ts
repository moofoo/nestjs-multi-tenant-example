import { Module } from '@nestjs/common';
import { PrismaBypassClientProvider, PrismaTenancyClientProvider } from './client-extensions';
import { PrismaTenancyService } from './prisma-tenancy.service';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from 'nestjs-prisma';

@Module({
    imports: [PrismaModule, ClsModule],
    providers: [PrismaTenancyService, PrismaBypassClientProvider, PrismaTenancyClientProvider],
    exports: [PrismaTenancyService]
})
export class PrismaTenancyModule { }