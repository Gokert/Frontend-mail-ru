import { get } from '@utils/ajax';
import { urls } from '@utils/config';
import { store } from '@store/store';
import { actionCheckSubscribeCalendar } from '@store/action/actionTemplates';

export interface NotificationClass {
  state: {
    permission: boolean;
    intervalFunc: any;
  };
}
export class NotificationClass {
  constructor () {
    this.state = {
      permission: false,
      intervalFunc: null
    };

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
          // eslint-disable-next-line no-invalid-this
          this.state.permission = true;
          registration.showNotification(data.title, notif);
        } else {
          // eslint-disable-next-line no-invalid-this
          this.state.permission = false;
        }
      });
    });
  };

  reqiestNotif = async () => {
    // Notification.requestPermission().then(permission => {
    //
    //   if (permission === 'granted') {
    //     // eslint-disable-next-line no-invalid-this
    //     this.state.permission = true;
    //   } else {
    //     // eslint-disable-next-line no-invalid-this
    //     this.state.permission = false;
    //   }
    //
    // });
  };

  startSending () {
    navigator.serviceWorker.ready.then((registration) => {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // eslint-disable-next-line no-invalid-this
          this.state.permission = true;
          if (store.getState('auth')?.status === 200) {
            setTimeout(this.sendNotify, 10000);
            this.state.intervalFunc = setInterval(this.sendNotify, 3600000);
          }
        } else {
          // eslint-disable-next-line no-invalid-this
          this.state.permission = false;
        }
      });
    });
  }

  cancelSending () {
    this.state.permission = false;
    clearInterval(this.state.intervalFunc);
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
    if (response?.status === 200 && response) {
      response?.body.days.forEach((elem) => {
        if (elem.dayNumber === response?.body.currentDay) {
          // eslint-disable-next-line no-invalid-this
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
