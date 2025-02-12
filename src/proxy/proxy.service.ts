import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  async getDishes(
    sortFields: string[],
    sortOrders: string[],
    limit: number,
    offset: number,
    filters: any[],
  ) {
    const params = {
      moduleName: 'warehouse.nomenclature.dish',
      className:
        'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.DishCategory',
      limit,
      offset,
      filters,
      sortFields,
      sortOrders,
    };

    const username = 'xc188';
    const password = 'nqvpWOBx';
    const credentials = `${username}:${password}`;
    const base64Credentials = Buffer.from(credentials, 'utf-8').toString(
      'base64',
    );

    const headers = {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
    };

    this.logger.debug(
      `Запрос списка блюд с параметрами: ${JSON.stringify(params)}`,
    );

    try {
      // Запрашиваем список блюд
      const response = await axios.get(
        'https://xc188.quickresto.ru/platform/online/api/list',
        { params, headers },
      );

      const dishes = response.data;

      // Проверяем, есть ли блюда
      if (!Array.isArray(dishes) || dishes.length === 0) {
        return [];
      }

      // Запрашиваем подробности по каждому блюду
      const dishDetailsPromises = dishes.map(async (dish) => {
        try {
          const details = await this.getDishDetails(dish.id, headers);
          return { ...dish, details }; // Объединяем данные
        } catch (error) {
          this.logger.warn(
            `Ошибка загрузки деталей блюда с ID ${dish.id}: ${error.message}`,
          );
          return dish; // Если произошла ошибка, возвращаем блюдо без деталей
        }
      });

      // Дожидаемся выполнения всех запросов
      const fullDishes = await Promise.all(dishDetailsPromises);

      return fullDishes;
    } catch (error) {
      this.logger.error(
        `Ошибка при запросе списка блюд: ${error.response ? error.response.data : error.message}`,
      );
      throw new Error('Ошибка при запросе списка блюд');
    }
  }

  async getDishDetails(objectId: number, headers: any) {
    const params = {
      objectId,
      moduleName: 'warehouse.nomenclature.dish',
      className: 'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.Dish',
    };

    this.logger.debug(`Запрос деталей блюда с ID ${objectId}`);

    try {
      const response = await axios.get(
        `https://xc188.quickresto.ru/platform/online/api/read?`,
        {
          params,
          headers: headers,
        },
      );
      console.log('response.data', response.data);

      return response.data;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении деталей блюда с ID ${objectId}: ${error.response ? error.response.data : error.message}`,
      );
      throw new Error(`Ошибка при получении деталей блюда с ID ${objectId}`);
    }
  }
}
