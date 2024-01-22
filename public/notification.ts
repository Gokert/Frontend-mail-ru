import { get } from '@utils/ajax';
import { responseStatus, urls } from '@utils/config';
import { store } from '@store/store';
import { actionCheckSubscribeCalendar } from '@store/action/actionTemplates';

export class NotificationClass {
  private permission;
  private intervalFunc;
  constructor () {
    this.permission = false;
    this.intervalFunc = null;

    store.subscribe('logout', this.cancelSending.bind(this));
    store.subscribe('auth', this.startSending.bind(this));
  }

  renderUI = (data) => {
    const notif = {
      body: data.body,
      icon: 'https://movie-hub.ru/icons/brandTitle.webp',
      requireInteraction: true
    };

    navigator.serviceWorker.ready.then((registration) => {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.permission = true;
          registration.showNotification(data.title, notif);
        } else {
          this.permission = false;
        }
      });
    });
  };

  startSending () {
    navigator.serviceWorker.ready.then((registration) => {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.permission = true;
          if (store.getState('auth')?.status === responseStatus.success) {
            setTimeout(this.sendNotify, 10000);
            this.intervalFunc = setInterval(this.sendNotify, 3600000);
          }
        } else {
          this.permission = false;
        }
      });
    });
  }

  cancelSending () {
    this.permission = false;
    clearInterval(this.intervalFunc);
  }

  sendNotify = async () => {
    const perm = await Notification.requestPermission();
    await store.dispatch(actionCheckSubscribeCalendar());
    const result = store.getState('checkSubscribeCalendar');
    if (perm !== 'granted' || result?.body?.subscribe === false) {
      this.cancelSending();
      return;
    }

    const response = await get({
      url: urls.calendar
    });
    if (response?.status === responseStatus.success && response) {
      response?.body.days.forEach((elem) => {
        if (elem.dayNumber === response?.body.currentDay) {
          this.renderUI({
            title: 'Уведомление о релизах',
            body: `Сегодня вышел '${elem.dayNews}', не пропустите!`
          });
        }
      });
    }
  };
}

export const notification = new NotificationClass();
