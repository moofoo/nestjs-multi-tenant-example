import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    Patch,
    Delete,
    ParseIntPipe
} from '@nestjs/common';

import type { Prisma } from 'app-prisma';
import { PatientsService } from './patients.service';


@Controller('patients')
export class PatientsController {
    constructor(private readonly patients: PatientsService) { }
    @Get()
    findAll() {
        return this.patients.findMany({});
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.patients.findUnique({ where: { id } });
    }

    @Post()
    create(@Body() data: Prisma.PatientCreateInput) {
        return this.patients.create({ data });
    }

    @Post(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.PatientUpdateInput) {
        return this.patients.update({ where: { id }, data });
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.patients.delete({ where: { id } });
    }


}

