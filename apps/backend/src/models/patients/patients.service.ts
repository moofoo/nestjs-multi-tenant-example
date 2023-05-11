import { Injectable } from '@nestjs/common';
import type { Prisma } from 'app-prisma';
import { PrismaTenancyService } from 'prisma-tenancy';

@Injectable()
export class PatientsService {
    constructor(private readonly prisma: PrismaTenancyService) { }

    findUnique(input: Prisma.PatientFindUniqueArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.findUnique(input);
    }

    findFirst(input: Prisma.PatientFindFirstArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.findFirst(input);
    }

    async findMany(input: Prisma.PatientFindManyArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.findMany(input);
    }

    create(input: Prisma.PatientCreateArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.create(input);
    }

    update(input: Prisma.PatientUpdateArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.update(input);
    }

    delete(input: Prisma.PatientDeleteArgs, bypass = false) {
        return this.prisma.switch(bypass).patient.delete(input);
    }
}