import { Markup } from 'telegraf';

export function actionButton() {
  return Markup.inlineKeyboard(
    [
      Markup.button.webApp(
        'Сделать заказ',
        'https://n-n-kareev.github.io/coffee/pages/menu',
      ),
      Markup.button.webApp(
        'История заказов',
        'https://n-n-kareev.github.io/coffee/pages/history',
      ),
      Markup.button.webApp(
        'Аккаунт',
        'https://n-n-kareev.github.io/coffee/pages/profile',
      ),
    ],
    {
      columns: 1,
    },
  );
}
