import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaTenancyModule } from 'prisma-tenancy';
@Module({
    imports: [PrismaTenancyModule],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule { }
