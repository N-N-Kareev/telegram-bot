import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { actionButton } from './buttons/app.battons';

@Update()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startBot(@Ctx() ctx: Context) {
    this.logger.log(
      `Received /start from user ${ctx.from.id} (${ctx.from.username || 'unknown'})`,
    );
    try {
      await ctx.reply(
        `
Добро пожаловать в Мока Лайт!

Приветствуем вас в нашем уютном уголке, где аромат свежесваренного кофе и теплый прием создают идеальную атмосферу для приятного отдыха!

Мы рады, что вы выбрали нас, и хотим сделать ваше пребывание у нас максимально комфортным и приятным. В нашем меню вы найдете широкий выбор кофе, чая, свежей выпечки и других вкусностей, которые поднимут вам настроение и подарят заряд энергии.

Наш Telegram-бот создан специально для вас, чтобы сделать ваш заказ быстрым и удобным. С его помощью вы можете:

Просмотреть наше меню и узнать о новинках.
Сделать заказ и выбрать удобное время для его получения.
Заказать доставку кофе прямо к вам домой или забрать его на месте.
Узнать о наших акциях и специальных предложениях.
Оставить отзыв и поделиться своими впечатлениями.
Мы всегда рады вашим предложениям и отзывам, чтобы стать еще лучше для вас.

Спасибо, что вы с нами! Наслаждайтесь вашим кофе и приятного дня!

С уважением,
Команда Мока Лайт`,
        actionButton(),
      );
      this.logger.log(`Successfully sent response to user ${ctx.from.id}`);
    } catch (error) {
      this.logger.error(
        `Error processing /start for user ${ctx.from.id}: ${error.message}`,
        error.stack,
      );
      await ctx.reply('Произошла ошибка. Попробуйте снова позже.');
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    if ('text' in ctx.message) {
      this.logger.log(
        `Text message from ${ctx.from.id} (${ctx.from.username || 'unknown'}): ${ctx.message.text}`,
      );
      await ctx.reply('Сообщение получено! Попробуйте использовать кнопки.');
    } else {
      this.logger.log(
        `Non-text message from ${ctx.from.id} (${ctx.from.username || 'unknown'})`,
      );
    }
  }

  @On('web_app_data')
  async onWebAppData(@Ctx() ctx: Context) {
    this.logger.log(
      `WebApp data from ${ctx.from.id}: ${JSON.stringify(ctx.webAppData)}`,
    );
    await ctx.reply('Данные из WebApp получены!');
  }
}
