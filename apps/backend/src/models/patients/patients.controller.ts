import {
    Controller,
    Get,
    ParseIntPipe,
    Param
} from '@nestjs/common';

import { PatientsService } from './patients.service';
@Controller('patients')
export class PatientsController {
    constructor(private readonly patients: PatientsService) { }

    @Get()
    findMany() {
        return this.patients.findMany({});
    }

    @Get(':id')
    findUnique(@Param('id', ParseIntPipe) id: number) {
        return this.patients.findUnique({ where: { id } });
    }
}