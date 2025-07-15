import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from './proxy.service'; // Импортируем сервис

@Controller('proxy')
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Get('dishes')
  async proxyDishesRequest(
    @Query('sortFields') sortFields: string[],
    @Query('sortOrders') sortOrders: string[],
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('filters') filters: string,
    @Res() res: Response,
  ) {
    this.logger.debug(
      `Received request: sortFields=${sortFields}, limit=${limit}, filters=${filters}`,
    );

    // Логируем только ключевые параметры запроса
    this.logger.debug(
      `Запрос к QuickResto с параметрами: limit=${limit}, offset=${offset}, filters=${filters ? filters.length : 'не указаны'}`,
    );

    // Парсим строку фильтров, если она есть
    let parsedFilters = [];
    if (filters) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        parsedFilters = JSON.parse(filters);
      } catch (error) {
        this.logger.error(`Ошибка при парсинге фильтров: ${error.message}`);
        return res.status(400).json({
          message: 'Ошибка при парсинге фильтров',
          details: error.message,
        });
      }
    }

    try {
      const dishes = await this.proxyService.getDishes(
        sortFields,
        sortOrders,
        limit,
        offset,
        parsedFilters,
      );

      this.logger.debug(
        `Ответ от QuickResto: количество записей=${dishes ? dishes.length : 0}`,
      );
      res.status(200).json(dishes);
    } catch (error) {
      this.logger.error(
        `Ошибка при запросе к QuickResto: ${error.message}`,
        error.stack,
      );
      res.status(500).json({
        message: 'Ошибка при запросе к QuickResto',
        details: error.message,
      });
    }
  }
}
