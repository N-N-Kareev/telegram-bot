import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.update';
import { ProxyService } from './proxy/proxy.service';
import { ProxyController } from './proxy/proxy.controller';
import * as LocalSession from 'telegraf-session-local';
import { HttpModule } from '@nestjs/axios';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: '7683145206:AAHBuzz5mv81dnCbenBf-KnH4k6L3l78iPo',
    }),
    HttpModule,
  ],
  controllers: [ProxyController],
  providers: [AppService, AppController, ProxyService, ProxyController],
})
export class AppModule {}
