import { Component } from '@components/component';
import * as templateCalendar from '@components/Calendar/calendar.hbs';
import { responseStatus } from '@utils/config';
import { actionSubCalendar } from '@store/action/actionTemplates';
import { store } from '@store/store';
import { notification } from '@/notification';
import { isPush } from '@utils/std';

/**
 * Класс создания календаря новинок
 * @class Calendar
 * @typedef {Calendar}
 */
export class Calendar extends Component {
  private calendarEvent;

  /**
   * Метод для рендеринга HTML кода
   * @param info
   * @param result
   * @return {string} html нижней панели
   */
  render (result) {
    const calendar = {
      monthName: result.monthName,
      monthText: result.monthText,
      currentDay: result.currentDay,
      days: Array.from({ length: 30 }, (_, i) => {
        const dayNumber = i + 1;
        const dayNews =
          result?.days.find((day) => day.dayNumber === dayNumber)?.dayNews ||
          '';
        const filmID =
          result?.days.find((day) => day.dayNumber === dayNumber)?.id || '';

        return { dayNumber, dayNews, filmID };
      })
    };

    this.element = this.createHTMLElement(
      templateCalendar(calendar),
      '.calendar'
    );
    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addEvent();
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    this.element?.removeEventListener('click', this.calendarEvent);
  }

  /**
   * Метод добавления обработчика событий
   */
  addEvent () {
    this.calendarEvent = (event) => {
      const filmId = event?.target
        ?.closest('.calendar__days__day')
        ?.getAttribute('data-section');

      switch (true) {
        case event.target.className === 'calendar__days__subscribe':
          if (store.getState('auth').status === responseStatus.success) {
            store.subscribe('subscribeCalendar', this.subscribe.bind(this));
            store.dispatch(actionSubCalendar());
          } else {
            this.renderNewPage('/login');
          }
          break;
        case isPush(event, '.calendar__days'):
          if (filmId !== '') {
            this.renderNewPage('/film', `/${filmId}`);
          }
          break;
        default:
          break;
      }
    };

    this.element?.addEventListener('click', this.calendarEvent);
  }

  /**
   * Подписка на получение результата подписки
   */
  subscribe () {
    store.unsubscribe('subscribeCalendar', this.subscribe.bind(this));
    const result = store.getState('subscribeCalendar_res');

    if (result['status'] === responseStatus.success) {
      if (result?.body?.subscribe === false) {
        notification.renderUI({
          title: 'Отписка от уведомлений о новинках',
          body: 'Вы успешно отписались от новостей'
        });

        notification.cancelSending();
      } else {
        notification.renderUI({
          title: 'Подписка на уведомления о новинках',
          body: 'Благодарим Вас за подсписку!'
        });

        notification.startSending();
      }
    }
  }
}
