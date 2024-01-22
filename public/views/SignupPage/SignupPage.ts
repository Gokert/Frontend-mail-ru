import { View } from '@views/view';
import { errorInputs, responseStatus, ROOT } from '@utils/config';
import { store } from '@store/store';
import {
  actionCSRF,
  actionSignin,
  actionSignup
} from '@store/action/actionTemplates';
import { image } from '@components/Image/image';
import { Signup } from '@components/Signup/signup';
import { isPush } from '@utils/std';

export interface SignupPage {
  state: {
    statusSignup: number;
    haveEvent: boolean;
  };
}
/**
 * Класс регистрации пользователя
 * @class SignupPage
 * @typedef {SignupPage}
 */
export class SignupPage extends View {
  private popupEvent: (event) => void;
  private signupComponent;

  /**
   * Конструктор для формирования родительского элемента
   * @param ROOT
   * @class
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      statusSignup: 0,
      haveEvent: false
    };

    store.subscribe('statusSignup', this.subscribeSignupStatus.bind(this));
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

    const signup = new Signup(ROOT);
    this.signupComponent = signup;

    const containerHTML = this.element.querySelector('.image-container');
    containerHTML?.appendChild(signup.render());

    this.componentDidMount();
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addEvent();
  }

  /**
   * Метод добавление обработки событий
   */
  addEvent () {
    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.redirect-to-signin'):
          this.componentWillUnmount();
          this.renderNewPage('/login');
          break;
        case isPush(event, '.sign-frame-img'):
          this.componentWillUnmount();
          this.renderNewPage('/');
          break;
        case isPush(event, '.button-submit'):
          event.preventDefault();
          this.signupComponent.clearErrors();
          const data = this.signupComponent.getData();

          if (
            this.signupComponent.validateForm(
              data.login,
              data.password,
              data.passwordSecond,
              data.email,
              data.birthday
            )
          ) {
            store.dispatch(
              actionSignup({
                login: data.login,
                password: data.password,
                email: data.email,
                birthday: data.birthday
              })
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
  }

  /**
   * Подписка на полученте результатов регистрации
   */
  subscribeSignupStatus () {
    this.state.statusSignup = store.getState('statusSignup');

    if (this.handlerStatus()) {
      store.subscribe('login', this.subscribeSigninStatus.bind(this));
      const data = this.signupComponent.getData();
      store.dispatch(
        actionSignin({
          login: data.login,
          password: data.password
        })
      );
    }
  }

  /**
   * Подписка на полученте результатов авторизации
   */
  subscribeSigninStatus () {
    if (store.getState('login')) {
      store.unsubscribe('login', this.subscribeSigninStatus.bind(this));
      this.state.statusSignup = 0;
      this.componentWillUnmount();
      this.renderNewPage('/');
      return;
    }

    this.render();
  }

  /**
   * Метод обработки статуса результата
   */
  handlerStatus () {
    switch (this.state.statusSignup) {
      case responseStatus.success:
        return true;
      case responseStatus.notAuthorized:
        this.signupComponent.insertText(
          errorInputs.LoginOrPasswordError,
          this.signupComponent.errorsHTML['login']
        );
        break;
      case responseStatus.alreadyExists:
        this.signupComponent.insertText(
          errorInputs.LoginExists,
          this.signupComponent.errorsHTML['login']
        );
        break;
      case responseStatus.invalidError:
        this.signupComponent.insertText(
          errorInputs.badRequest,
          this.signupComponent.errorsHTML['email']
        );
        break;
      case responseStatus.csrfError:
        store.dispatch(actionCSRF()).then((response) => {
          const data = this.signupComponent.getData();
          store.dispatch(
            actionSignup({
              login: data.login,
              password: data.password,
              email: data.email,
              birthday: data.birthday
            })
          );
        });
        break;
      default:
        this.signupComponent.insertText(
          errorInputs.ServerError,
          this.signupComponent.errorsHTML['login']
        );
        break;
    }
    return false;
  }
}
