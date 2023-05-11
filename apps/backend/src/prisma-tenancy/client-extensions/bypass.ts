import { PrismaModule, PrismaService } from 'nestjs-prisma';
import { ClsService } from 'nestjs-cls';

const useFactory = (prisma: PrismaService, store: ClsService) => {
    console.log('Bypass Client useFactory called');

    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query }) {
                    const session = store.get('session');
                    const tenantId = session.tenantId;

                    const [, result] = await prisma.$transaction([
                        prisma.$executeRaw`SELECT set_config('tenancy.tenant_id', ${`${tenantId || 0}`}, TRUE), set_config('tenancy.bypass', '1', TRUE)`,
                        query(args),
                    ]);
                    return result;
                },
            },
        },
    });
};

export type ExtendedBypassClient = ReturnType<typeof useFactory>;

export const BYPASS_CLIENT_TOKEN = Symbol('BYPASS_CLIENT_TOKEN');

export const PrismaBypassClientProvider = {
    provide: BYPASS_CLIENT_TOKEN,
    imports: [PrismaModule],
    inject: [PrismaService, ClsService],
    useFactory
};