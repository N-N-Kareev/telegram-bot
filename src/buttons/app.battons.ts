import { Markup } from 'telegraf';

export function actionButton() {
  return Markup.inlineKeyboard(
    [
      Markup.button.webApp(
        'Сделать заказ',
        'https://coffee-yh43.vercel.app/pages/menu',
      ),
      Markup.button.webApp(
        'История заказов',
        'https://coffee-yh43.vercel.app/pages/history',
      ),
      Markup.button.webApp(
        'Профиль',
        'https://coffee-yh43.vercel.app/pages/profile',
      ),
      Markup.button.webApp(
        'О нас',
        'https://coffee-yh43.vercel.app/pages/about-us',
      ),
    ],
    {
      columns: 1,
    },
  );
}
