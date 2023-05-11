import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from 'nestjs-prisma';
import { ClsMiddleware } from 'nestjs-cls';
import { sessionOpts } from 'session';
import { getIronSession } from 'iron-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('nest');

  app.use(
    new ClsMiddleware({
      generateId: true,
      resolveProxyProviders: true,
      async setup(cls, req, res) {
        const session = await getIronSession(req, res, sessionOpts);
        cls.set('session', session);
      },
    }).use
  );

  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(process.env.PORT, process.env.INDOCKER === '1' ? '0.0.0.0' : '127.0.0.1');
}

bootstrap();
