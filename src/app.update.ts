import { AppService } from './app.service';
import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { actionButton } from './buttons/app.battons';

@Update()
export class AppController {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startBot(ctx: Context) {
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
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    if ('text' in ctx.message) {
      console.log(
        `Text message from ${ctx.from.id} (${ctx.from.username || 'unknown'}): ${ctx.message.text}`,
      );
      await ctx.reply('Сообщение получено! Попробуйте использовать кнопки.');
    } else {
      console.log(
        `Non-text message from ${ctx.from.id} (${ctx.from.username || 'unknown'})`,
        ctx.message,
      );
      await ctx.reply(
        'Пожалуйста, отправьте текстовое сообщение или используйте кнопки.',
      );
    }
  }
  @On('web_app_data')
  async onWebAppData(@Ctx() ctx: Context) {
    console.log(`WebApp data from ${ctx.from.id}:`, ctx.webAppData);
    await ctx.reply('Данные из WebApp получены!');
  }
}
