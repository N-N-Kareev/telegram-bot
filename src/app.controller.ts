import { Controller, Get } from '@nestjs/common';
import * as database from '../database.js'; // Путь к файлу database.js

@Controller('app')
export class AppController {
  @Get('menu')
  getData() {
    console.log('database', database);
    return database;
  }
}
