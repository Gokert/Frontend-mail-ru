import { Component } from '@components/component';
import * as templateSignin from '@components/Signin/signin.hbs';
import { inputButton } from '@components/inputButton/inputButton';
import { buttonSubmit } from '@components/ButtonSubmit/buttonSubmit';
import {
  addErrorsActive,
  insertText,
  removeErrors,
  removeErrorsActive
} from '@utils/addError';
import { errorInputs } from '@utils/config';
import { validateLogin, validatePassword } from '@utils/validate';

/**
 * Класс рендеринга авторизации
 * @class Signin
 * @typedef {Signin}
 */
export class Signin extends Component {
  private errorsHTML;
  private inputsHTML;
  private wraps;

  /**
   * Метод рендеринга элемента
   * @return {string} html авторизации
   */
  render () {
    this.element = this.createHTMLElement(templateSignin(), '.popupSign');
    this.componentDidMount();
    this.init();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addElements();
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {}

  /**
   * Метод длбавление элементов
   */
  addElements () {
    const loginText = this.element.querySelector('.login-text');
    const passwordText = this.element.querySelector('.password-text');
    const button = this.element.querySelector('.container-login');

    loginText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'login', module: 'signin' })
    );

    passwordText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'password',
        module: 'signin',
        type: 'password'
      })
    );

    button!.insertAdjacentHTML(
      'afterbegin',
      buttonSubmit.render({ text: 'Войти' })
    );
  }

  /**
   * Метод валидации данных
   * @param login
   * @param password
   */
  validateForm (login, password) {
    const elements = this.errorsHTML;
    const wraps = this.wraps;
    let result = true;

    if (!login) {
      insertText(elements['login'], errorInputs.NotAllElement);
      addErrorsActive(wraps['login']);
      result = false;
    }

    if (!password) {
      insertText(elements['password'], errorInputs.NotAllElement);
      addErrorsActive(wraps['password']);
      result = false;
    }

    const loginValidate = validateLogin(login);
    if (!loginValidate.result && login.length > 0) {
      insertText(elements['login'], loginValidate.error);
      addErrorsActive(wraps['login']);
      result = false;
    }

    const passwordValidate = validatePassword(password);
    if (!passwordValidate.result && password.length > 0) {
      insertText(elements['password'], passwordValidate.error);
      addErrorsActive(wraps['password']);
      result = false;
    }

    return result;
  }

  /**
   * Метод очистки инпутов
   */
  clearInputs () {
    this.inputsHTML['login'] = '';
    this.inputsHTML['password'] = '';
  }

  /**
   * Метод очистки ошибок
   */
  clearErrors () {
    removeErrors(this.errorsHTML);
    removeErrorsActive(this.wraps);
  }

  /**
   * Метод получнгтя данных из инпутов
   */
  getData () {
    const login: HTMLInputElement | null = this.element.querySelector(
      '.login-input-signin'
    );
    const password: HTMLInputElement | null = this.element.querySelector(
      '.password-input-signin'
    );

    return {
      login: <string>login?.value.trim(),
      password: <string>password?.value
    };
  }

  /**
   * Метод добавления ошибок
   * @param errorText
   */
  insertText (errorText) {
    insertText(this.errorsHTML, errorText);
  }

  /**
   * Метод инициализации ссылок на элементы
   */
  init () {
    const errorLogin = this.element.querySelector('.error-login');
    const errorPassword = this.element.querySelector('.error-password');
    const wrapLogin = this.element.querySelector('.wrap.login');
    const wrapPassword = this.element.querySelector('.wrap.password');

    this.wraps = { login: wrapLogin, password: wrapPassword };
    this.errorsHTML = { login: errorLogin, password: errorPassword };
    this.inputsHTML = { login: '', password: '' };
  }
}
