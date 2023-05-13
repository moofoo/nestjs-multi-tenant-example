import { Injectable } from '@nestjs/common';
import type { Prisma } from 'app-prisma';
import { PrismaTenancyService } from 'prisma-tenancy';
@Injectable()
export class PatientsService {
    constructor(private readonly prisma: PrismaTenancyService) { }

    findMany(input: Prisma.PatientFindManyArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.findMany(input);
    }

    findUnique(input: Prisma.PatientFindUniqueArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.findUnique(input);
    }
}