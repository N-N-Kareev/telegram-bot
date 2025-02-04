import { Controller, Get } from '@nestjs/common';
import * as database from '../database.js'; // Предположим, что файл находится в корне проекта

@Controller('app')
export class AppController {
  @Get('menu')
  getData() {
    return database;
  }
}
