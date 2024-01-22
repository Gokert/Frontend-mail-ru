import { View } from '@views/view';
import { errorInputs, responseStatus, ROOT } from '@utils/config';
import { store } from '@store/store';
import { actionCSRF, actionSignin } from '@store/action/actionTemplates';
import { router } from '@router/router';
import { image } from '@components/Image/image';
import { Signin } from '@components/Signin/signin';
import { isPush } from '@utils/std';

export interface SigninPage {
  state: {
    statusLogin: number;
    haveEvent: boolean;
  };
}

/**
 * Класс регистрации пользователя
 * @class SigninPage
 * @typedef {SigninPage}
 */
export class SigninPage extends View {
  private popupEvent: (event) => void;
  private signinComponent: Signin;
  /**
   * Конструктор класса
   * @param ROOT
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      statusLogin: 0,
      haveEvent: false
    };
  }

  /**
   * Метод создания страницы
   */
  render () {
    this.renderDefaultPage(false, false);
    this.element = <HTMLElement>document.querySelector('main');

    this.element?.insertAdjacentHTML('afterbegin', image.render({}));
    const icon = this.element.querySelector('.image-container') as HTMLElement;
    icon!.style.backgroundImage = 'url("/icons/loginImage.webp")';
    icon!.style.justifyContent = 'center';

    const signin = new Signin(ROOT);
    this.signinComponent = signin;
    const containerHTML = this.element.querySelector('.image-container');
    containerHTML?.appendChild(signin.render());

    this.componentDidMount();
    store.subscribe('login', this.subscribeSigninStatus.bind(this));
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addEvent();
  }

  /**
   * Метод добавления обработчика событий
   */
  addEvent () {
    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.redirect-to-signup'):
          store.unsubscribe('login', this.subscribeSigninStatus);
          this.componentWillUnmount();
          this.renderNewPage('/registration');
          break;
        case isPush(event, '.sign-frame-img'):
          store.unsubscribe('login', this.subscribeSigninStatus);
          this.componentWillUnmount();
          this.renderNewPage('/');
          break;
        case isPush(event, '.button-submit'):
          event.preventDefault();
          this.signinComponent.clearErrors();
          const data = this.signinComponent.getData();

          if (this.signinComponent.validateForm(data.login, data.password)) {
            store.dispatch(
              actionSignin({ login: data.login, password: data.password })
            );
          }
          break;
        default:
          break;
      }
    };

    const popup = this.element.querySelector('.popupSign');
    popup?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    const popup = this.element.querySelector('.popupSign');
    popup?.removeEventListener('click', this.popupEvent);
    store.unsubscribe('auth', this.redirectToMain.bind(this));
    store.unsubscribe('login', this.subscribeSigninStatus.bind(this));
  }

  /**
   * Метод обработки статуса результата
   */
  handlerStatus () {
    switch (this.state.statusLogin) {
      case responseStatus.success:
        return true;
      case responseStatus.notAuthorized:
        this.signinComponent.insertText(errorInputs.LoginOrPasswordError);
        break;
      case responseStatus.csrfError:
        store.dispatch(actionCSRF()).then((response) => {
          const data = this.signinComponent.getData();
          store.dispatch(
            actionSignin({
              login: data.login,
              password: data.password
            })
          );
        });
        break;
      default:
        this.signinComponent.insertText(errorInputs.ServerError);
        break;
    }

    return false;
  }

  /**
   * Подписка на полученте результатов авторизации
   */
  subscribeSigninStatus () {
    this.state.statusLogin = store.getState('login').status;

    if (this.handlerStatus()) {
      store.unsubscribe('auth', this.redirectToMain.bind(this));
      store.unsubscribe('login', this.subscribeSigninStatus);

      const popup = document.querySelector('.popupSign');
      popup?.removeEventListener('click', this.popupEvent);

      this.state.statusLogin = 0;
      this.componentWillUnmount();

      this.signinComponent.clearInputs();
    }
  }

  /**
   * Редирект на главную страницу
   */
  redirectToMain () {
    const status = store.getState('auth').status;
    if (status === responseStatus.success) {
      this.componentWillUnmount();
      this.renderNewPage(router.lastView.path, router.lastView.props);
      router.lastView = { path: '/', props: '' };
    }
  }
}
