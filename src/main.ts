import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { corsOptions } from './users/config/corsOptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors(corsOptions))

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
