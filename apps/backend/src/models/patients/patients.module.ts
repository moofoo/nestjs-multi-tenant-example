import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PrismaTenancyModule } from 'prisma-tenancy';

@Module({
    imports: [PrismaTenancyModule],
    controllers: [PatientsController],
    providers: [PatientsService],
    exports: [PatientsService]
})
export class PatientsModule { }
