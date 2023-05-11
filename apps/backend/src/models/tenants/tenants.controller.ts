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
import { TenantsService } from './tenants.service';



@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenants: TenantsService) { }

    @Get()
    findAll() {
        return this.tenants.findMany({});
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tenants.findUnique({ where: { id } });
    }

    @Post()
    create(@Body() data: Prisma.TenantCreateInput) {
        return this.tenants.create({ data });
    }

    @Post(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.TenantUpdateInput) {
        return this.tenants.update({ where: { id }, data });
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.tenants.delete({ where: { id } });
    }


}

