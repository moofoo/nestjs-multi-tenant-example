import { Controller, Get } from '@nestjs/common';
import { Public } from 'decorators/public.decorator';
import { PrismaTenancyService } from 'prisma-tenancy';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaTenancyService) { }

    @Public()
    @Get('/stats')
    getStats() {
        const metrics = this.prisma.tenancy.$metrics.json();
        return metrics;
    }
}
