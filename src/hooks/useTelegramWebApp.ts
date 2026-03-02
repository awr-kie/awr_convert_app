import { useEffect } from 'react';

export const useTelegramWebApp = () => {
  useEffect(() => {
    // Проверяем, запущено ли приложение внутри Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Сообщаем Telegram, что приложение готово
      tg.ready();
      
      // Разворачиваем на всю высоту
      tg.expand();
      
      // Подстраиваем цвета под тему Telegram
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#000000');
      
      // Устанавливаем цвета хедера под тему
      tg.setHeaderColor(tg.backgroundColor || '#ffffff');
      
      // Показываем главную кнопку (опционально)
      // tg.MainButton.setText('ЗАКРЫТЬ');
      // tg.MainButton.onClick(() => tg.close());
      // tg.MainButton.show();
    }
  }, []);

  // Хелпер для закрытия приложения
  const closeApp = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  // Хелпер для получения данных пользователя
  const getUserData = () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return null;
  };

  return {
    isTelegram: !!window.Telegram?.WebApp,
    closeApp,
    userData: getUserData(),
  };
};

// Глобальный тип для TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        backgroundColor: string;
        textColor: string;
        headerColor: string;
        setHeaderColor: (color: string) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code: string;
          };
          query_id?: string;
        };
        MainButton: {
          text: string;
          color: string;
          text_color: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        // ... другие свойства при необходимости
      };
    };
  }
}