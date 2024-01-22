import { Component } from '@components/component';
import * as templateVideo from '@components/StartVideoContainer/startVideoContainer.hbs';

export class StartVideo extends Component {
  /**
   * Метод рендера элемента
   */
  render () {
    this.element = this.createHTMLElement(templateVideo(), '.video-container1');
    this.ComponentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  ComponentDidMount () {
    const sendEmail = this.element.querySelector('.send-email-main');
    sendEmail?.addEventListener('click', (event) => {
      const email = this.element.querySelector(
        '.input-main-email'
      ) as HTMLInputElement;
      const text = this.element.querySelector('.header__container__text');
      if (/.@./.test(email.value)) {
        text!.innerHTML = '<h2>Спасибо за подписку!</h2>';
      } else if (email.value === '') {
        event.preventDefault();
      }
    });
  }

  /**
   * Метод очистки
   */
  ComponentWillUnmount () {}
}
