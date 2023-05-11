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
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) { }

    @Get()
    findAll() {
        return this.users.findMany({});
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.users.findUnique({ where: { id } });
    }

    @Post()
    create(@Body() data: Prisma.UserCreateInput) {
        return this.users.create({ data });
    }

    @Post(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.UserUpdateInput) {
        return this.users.update({ where: { id }, data });
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.users.delete({ where: { id } });
    }


}

