import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as pLimit from 'p-limit';
import * as https from 'https';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly agent = new https.Agent({ keepAlive: true });
  private readonly limit = pLimit(5);

  private readonly username = 'xc188';
  private readonly password = 'nqvpWOBx';
  private readonly base64Credentials = Buffer.from(
    `${this.username}:${this.password}`,
    'utf-8',
  ).toString('base64');

  private readonly headers = {
    Authorization: `Basic ${this.base64Credentials}`,
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
  };

  async getDishes(
    sortFields: string[] = ['name'],
    sortOrders: string[] = ['asc'],
    limit: number = 1000,
    offset: number = 0,
    filters: any[],
    saveToFile: boolean = false,
    filterTakeaway: boolean = false,
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

    this.logger.debug(
      `Запрос списка блюд с параметрами: ${JSON.stringify(params)}`,
    );

    try {
      const response = await axios.get(
        'https://xc188.quickresto.ru/platform/online/api/tree',
        { params, headers: this.headers, httpsAgent: this.agent },
      );

      const dishes = response.data;

      if (!Array.isArray(dishes) || dishes.length === 0) {
        return [];
      }

      const dishDetailsPromises = dishes.map((dish) =>
        this.limit(() => this.getDishDetails(dish.id)),
      );

      const fullDishes = await Promise.all(dishDetailsPromises);

      const result = dishes.map((dish, index) => ({
        ...dish,
        details: fullDishes[index] || null,
      }));

      if (filterTakeaway) {
        const filteredDishes = this.getTakeawayDishesByRootCategory(result);
        if (saveToFile) {
          await this.saveToFile(filteredDishes, 'filtered_dishes.json');
        }
        return filteredDishes;
      }

      if (saveToFile) {
        await this.saveToFile(result, 'dishes.json');
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Ошибка при запросе списка блюд: ${error.response ? error.response.data : error.message}`,
      );
      throw new Error('Ошибка при запросе списка блюд');
    }
  }

  async getDishDetails(objectId: number) {
    const params = {
      objectId,
      moduleName: 'warehouse.nomenclature.dish',
      className:
        'ru.edgex.quickresto.modules.warehouse.nomenclature.dish.DishCategory',
    };

    this.logger.debug(`Запрос деталей блюда с ID ${objectId}`);

    try {
      const response = await axios.get(
        `https://xc188.quickresto.ru/platform/online/api/read`,
        { params, headers: this.headers, httpsAgent: this.agent },
      );

      return response.data || null;
    } catch (error) {
      this.logger.warn(
        `Ошибка при получении деталей блюда с ID ${objectId}: ${error.response ? error.response.data : error.message}`,
      );
      return null;
    }
  }

  async createOrder(
    cart: any[],
    orderType: string = 'takeaway',
    paymentMethod: string = 'card',
  ) {
    const payload = {
      moduleName: 'order.order',
      className: 'ru.edgex.quickresto.modules.order.order.Order',
      order: {
        type: orderType,
        items: cart.map((item) => ({
          dishId: item.articul,
          quantity: item.quantity,
          price: parseFloat(item.price.replace(' Р', '')),
          name: item.name,
        })),
        payment: {
          method: paymentMethod,
        },
        status: 'NEW',
      },
    };

    this.logger.debug(`Создание заказа с данными: ${JSON.stringify(payload)}`);

    try {
      const response = await this.limit(() =>
        axios.post(
          'https://xc188.quickresto.ru/platform/online/api/create',
          payload,
          { headers: this.headers, httpsAgent: this.agent },
        ),
      );

      const orderData = response.data;
      this.logger.log(`Заказ успешно создан: ID ${orderData.id}`);

      await this.saveToFile(orderData, `order_${orderData.id}.json`);

      return {
        orderId: orderData.id,
        total:
          orderData.total ||
          cart.reduce(
            (sum, item) =>
              sum + parseFloat(item.price.replace(' Р', '')) * item.quantity,
            0,
          ),
        status: orderData.status || 'NEW',
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при создании заказа: ${error.response ? JSON.stringify(error.response.data) : error.message}`,
      );
      throw new Error('Ошибка при создании заказа');
    }
  }

  private async saveToFile(data: any, filename: string) {
    try {
      const dirPath = path.resolve('./exports');
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      this.logger.log(`Данные успешно сохранены в ${filePath}`);
    } catch (error) {
      this.logger.error(`Ошибка при сохранении файла: ${error.message}`);
    }
  }

  private getTakeawayDishesByRootCategory(data: any[]) {
    const categories: Record<number, any> = {};
    const dishes: any[] = [];

    data.forEach((item) => {
      if (item.className.includes('DishCategory')) {
        categories[item.id] = item;
      } else if (item.className.includes('Dish')) {
        dishes.push(item);
      }
    });

    const rootCategories = Object.values(categories).filter(
      (cat) => !cat.parentId,
    );

    const takeawayCategory = Object.values(categories).find(
      (cat) => cat.name === 'НА ВЫНОС',
    );

    if (!takeawayCategory) {
      this.logger.warn('Категория "НА ВЫНОС" не найдена.');
      return {};
    }

    const takeawaySubcategories = new Set<number>();
    function collectSubcategories(parentId: number) {
      Object.values(categories).forEach((cat) => {
        if (cat.parentId === parentId) {
          takeawaySubcategories.add(cat.id);
          collectSubcategories(cat.id);
        }
      });
    }
    collectSubcategories(takeawayCategory.id);

    const takeawayDishes = dishes.filter((dish) =>
      takeawaySubcategories.has(dish.parentId),
    );

    const result: Record<string, any[]> = {};
    rootCategories.forEach((root) => {
      const relevantDishes = takeawayDishes.filter((dish) => {
        let currentCategory = categories[dish.parentId];

        while (currentCategory) {
          if (currentCategory.parentId === root.id) return true;
          currentCategory = categories[currentCategory.parentId];
        }

        return false;
      });

      if (relevantDishes.length > 0) {
        result[root.name] = relevantDishes;
      }
    });

    return result;
  }
}
