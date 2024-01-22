import { Component } from '@components/component';
import * as templateSignup from '@components/Signup/signup.hbs';
import { inputButton } from '@components/inputButton/inputButton';
import { buttonSubmit } from '@components/ButtonSubmit/buttonSubmit';
import {
  addErrorsActive,
  insertText,
  removeErrors,
  removeErrorsActive
} from '@utils/addError';
import { errorInputs } from '@utils/config';
import {
  validateBirthday,
  validateEmail,
  validateLogin,
  validatePassword
} from '@utils/validate';

/**
 * Класс рендеринга регистрации пользователя
 * @class Signup
 * @typedef {Signup}
 */
export class Signup extends Component {
  private inputsHTML;
  private errorsHTML;
  private wraps;

  /**
   * Метод рендеринга элемента
   * @return {string} html авторизации
   */
  render () {
    this.element = this.createHTMLElement(templateSignup(), '.popupSign');
    this.ComponentDidMount();
    this.init();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  ComponentDidMount () {
    this.addElements();
  }

  /**
   * Метод добавления элементов
   */
  addElements () {
    const loginText = this.element.querySelector('.login-text');
    const passwordFirstText = this.element.querySelector('.login-first-text');
    const passwordSecondText = this.element.querySelector('.login-second-text');
    const dateText = this.element.querySelector('.date-text');
    const emailText = this.element.querySelector('.email-text');
    const button = this.element.querySelector('.container-login');

    loginText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'login', module: 'signup' })
    );
    passwordFirstText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'password-first',
        module: 'signup',
        type: 'password'
      })
    );
    passwordSecondText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'password-second',
        module: 'signup',
        type: 'password'
      })
    );
    dateText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'birthday', module: 'signup', type: 'date' })
    );
    emailText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'email', module: 'signup' })
    );
    button!.insertAdjacentHTML(
      'afterbegin',
      buttonSubmit.render({ text: 'Войти' })
    );
  }

  /**
   * Метод очитски
   */
  ComponentWillUnmount () {}

  /**
   * Метод удаления ошибок
   */
  clearErrors () {
    removeErrors(this.errorsHTML);
    removeErrorsActive(this.wraps);
  }

  /**
   * Метод получения данных из инпутов
   */
  getData () {
    const elements = this.inputsHTML;

    const login = elements['login'].value.trim();
    const email = elements['email'].value.trim();
    const birthday = elements['birthday'].value.trim();
    const password = elements['passwordFirst'].value;
    const passwordSecond = elements['passwordSecond'].value;

    return {
      login: login,
      email: email,
      birthday: birthday,
      password: password,
      passwordSecond: passwordSecond
    };
  }

  /**
   * Метод добавления текста
   * @param errorText
   * @param HTMLElement
   */
  insertText (errorText, HTMLElement = null) {
    if (HTMLElement) {
      insertText(HTMLElement, errorText);
    } else {
      insertText(this.errorsHTML, errorText);
    }
  }

  /**
   * Метод валидации данных
   * @param login
   * @param password
   * @param passwordSecond
   * @param email
   * @param birthday
   */
  validateForm (login, password, passwordSecond, email, birthday) {
    const elements = this.errorsHTML;
    const wraps = this.wraps;
    let result = true;

    if (!login) {
      insertText(elements['login'], errorInputs.NotAllElement);
      addErrorsActive(wraps['login']);
      result = false;
    } else {
      const loginValidate = validateLogin(login);
      if (!loginValidate.result) {
        insertText(elements['login'], loginValidate.error);
        addErrorsActive(wraps['login']);
        result = false;
      }
    }

    if (!email) {
      insertText(elements['email'], errorInputs.NotAllElement);
      addErrorsActive(wraps['email']);
      result = false;
    } else if (!validateEmail(email)) {
      insertText(elements['email'], errorInputs.EmailNoValid);
      addErrorsActive(wraps['email']);
      result = false;
    }

    if (!password) {
      insertText(elements['passwordFirst'], errorInputs.NotAllElement);
      addErrorsActive(wraps['passwordFirst']);
      result = false;
    }

    if (!passwordSecond) {
      insertText(elements['passwordSecond'], errorInputs.NotAllElement);
      addErrorsActive(wraps['passwordSecond']);
      result = false;
    }

    if (!birthday) {
      insertText(elements['birthday'], errorInputs.NotAllElement);
      addErrorsActive(wraps['birthday']);
      result = false;
    } else {
      const validateResult = validateBirthday(birthday);
      if (!validateResult.result) {
        insertText(elements['birthday'], validateResult.error);
        addErrorsActive(wraps['birthday']);
        result = false;
      }
    }

    const isValidate = validatePassword(password);
    if (!isValidate.result && password.length > 0) {
      insertText(elements['passwordFirst'], isValidate.error);
      result = false;
    }

    if (
      password !== passwordSecond &&
      password.length > 0 &&
      passwordSecond.length > 0
    ) {
      insertText(
        [elements['passwordFirst'], elements['passwordSecond']],
        <string>errorInputs.PasswordsNoEqual
      );
      addErrorsActive([wraps['passwordFirst'], wraps['passwordSecond']]);
      result = false;
    }

    return result;
  }

  /**
   * Метод динициализации ссылок на элементы
   */
  init () {
    const loginHTML = this.element.querySelector('.login-input-signup');
    const emailHTML = this.element.querySelector('.email-input-signup');
    const passwordFirstHTML = this.element.querySelector(
      '.password-first-input-signup'
    );
    const passwordSecondHTML = this.element.querySelector(
      '.password-second-input-signup'
    );
    const birthdayHTML = this.element.querySelector('.birthday-input-signup');

    const wrapLogin = this.element.querySelector('.wrap.login');
    const wrapEmailHTML = this.element.querySelector('.wrap.email');
    const wrapPassword = this.element.querySelector('.wrap.password-first');
    const wrapSecondPassword = this.element.querySelector(
      '.wrap.password-second'
    );
    const wrapBirthdayHTML = this.element.querySelector('.wrap.birthday');

    const loginError = this.element.querySelector('.error-login');
    const passwordFirstError = this.element.querySelector(
      '.error-password-first'
    );
    const passwordSecondError = this.element.querySelector(
      '.error-password-second'
    );
    const emailError = this.element.querySelector('.error-email');
    const dateError = this.element.querySelector('.error-birthday');

    this.inputsHTML = {
      login: loginHTML,
      email: emailHTML,
      passwordFirst: passwordFirstHTML,
      passwordSecond: passwordSecondHTML,
      birthday: birthdayHTML
    };
    this.wraps = {
      login: wrapLogin,
      email: wrapEmailHTML,
      passwordFirst: wrapPassword,
      passwordSecond: wrapSecondPassword,
      birthday: wrapBirthdayHTML
    };
    this.errorsHTML = {
      login: loginError,
      email: emailError,
      passwordFirst: passwordFirstError,
      passwordSecond: passwordSecondError,
      birthday: dateError
    };
  }
}
