import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { ProxyService } from './proxy/proxy.service';
import { ProxyController } from './proxy/proxy.controller';
import * as LocalSession from 'telegraf-session-local';
import { HttpModule } from '@nestjs/axios';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: `8002422808:AAGeS1pPrsyCK1ft-zI7DMIBFouwg9o9G0U`,
      // token: '7494399180:AAHgOJrnCFBjo5PkZ-fiKxp7Y8sZ9c9Y5E8',
    }),
    HttpModule,
  ],
  controllers: [AppController, ProxyController],
  providers: [AppService, AppController, ProxyService, ProxyController],
})
export class AppModule {}
