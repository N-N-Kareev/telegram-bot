import { Module } from '@nestjs/common';
import { AppController } from './app.update';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: '7494399180:AAHgOJrnCFBjo5PkZ-fiKxp7Y8sZ9c9Y5E8',
    }),
  ],
  controllers: [],
  providers: [AppService, AppController],
})
export class AppModule {}
