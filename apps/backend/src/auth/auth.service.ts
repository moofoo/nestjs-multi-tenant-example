import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UsersService } from 'models/users/users.service';
import { TenantsService } from 'models/tenants/tenants.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(private readonly store: ClsService, private readonly user: UsersService, private readonly tenant: TenantsService) { }

    async login(credentials: { userName: string, password: string; }) {

        const { userName, password } = credentials;

        const dbUser = await this.user.findFirst({ where: { userName } }, true);

        if (!dbUser) {
            throw new UnauthorizedException('Invalid Username or Password 1');
        }

        const passCheck = await compare(password, dbUser.password);

        if (!passCheck) {
            throw new UnauthorizedException('Invalid Username or Password 2');
        }

        const dbTenant = await this.tenant.findUnique({ where: { id: dbUser.tenantId } }, true);

        if (!dbTenant) {
            throw new InternalServerErrorException('Tenant Not Found');
        }

        const session = this.store.get('session');

        session.userName = dbUser.userName;
        session.tenantId = dbUser.tenantId;
        session.tenantName = dbTenant.displayName;
        session.isAdmin = dbTenant.isAdmin;
        session.authenticated = true;

        await session.save();

        return 'ok';
    }

    async logout() {
        const session = this.store.get('session');

        await session.destroy();

        return 'ok';
    }
}