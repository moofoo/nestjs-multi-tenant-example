import { Injectable } from '@nestjs/common';
import type { Prisma } from 'app-prisma';
import { PrismaTenancyService } from 'prisma-tenancy';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaTenancyService) { }

    findUnique(input: Prisma.UserFindUniqueArgs, bypass = false) {
        return this.prisma.switch(bypass).user.findUnique(input);
    }

    findFirst(input: Prisma.UserFindFirstArgs, bypass = false) {
        return this.prisma.switch(bypass).user.findFirst(input);
    }

    findMany(input: Prisma.UserFindManyArgs, bypass = false) {
        return this.prisma.switch(bypass).user.findFirst(input);
    }

    create(input: Prisma.UserCreateArgs, bypass = false) {
        return this.prisma.switch(bypass).user.create(input);
    }

    update(input: Prisma.UserUpdateArgs, bypass = false) {
        return this.prisma.switch(bypass).user.update(input);
    }

    delete(input: Prisma.UserDeleteArgs, bypass = false) {
        return this.prisma.switch(bypass).user.delete(input);
    }
}