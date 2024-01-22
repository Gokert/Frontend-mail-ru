import { Component } from '@components/component';
import * as templateSettings from '@components/Settings/settings.hbs';
import { errorInputs } from '@utils/config';
import { inputButton } from '@components/inputButton/inputButton';
import { buttonSubmit } from '@components/ButtonSubmit/buttonSubmit';
import {
  addErrorsActive,
  insertInInput,
  insertText,
  removeErrors,
  removeErrorsActive
} from '@utils/addError';
import { dateConverter } from '@utils/dateConverter';
import {
  validateBirthday,
  validateEmail,
  validateLogin,
  validatePassword
} from '@utils/validate';

/**
 * Класс рендеринга авторизации
 * @class Settings
 * @typedef {Settings}
 */
export class Settings extends Component {
  public inputsHTML;
  public wraps;
  public errorsHTML;
  public file;
  public userInfo;

  /**
   * Метод рендеринга элемента
   * @param result
   * @return {string} html авторизации
   */
  render (result = null) {
    this.element = this.createHTMLElement(
      templateSettings(result),
      '.settings'
    );
    this.ComponentDidMount();
    this.init();
    return this.element;
  }

  /**
   * Метод очистки
   */
  ComponentWillUnmount () {}

  /**
   * Метод инициализации страницы
   */
  ComponentDidMount () {
    this.addElements();
  }

  /**
   * Метод получения данных
   */
  getData () {
    const elements = this.inputsHTML;
    const login = elements['login']?.value.trim();
    const email = elements['email']?.value;
    const birthday = elements['birthday']?.value;
    const password = elements['passwordFirst']?.value;
    const passwordSecond = elements['passwordSecond']?.value;
    let file;

    if (elements['file']?.files[0]) {
      file = elements['file']?.files[0];
    } else if (this.file !== '') {
      file = this.file;
    }

    return {
      login: login,
      email: email,
      birthday: birthday,
      password: password,
      passwordSecond: passwordSecond,
      file: file
    };
  }

  /**
   * Метод получения данных типа FormData
   */
  getFormData () {
    const data = new FormData();
    const info = this.getData();

    data.append('login', info.login);
    data.append('email', info.email);
    data.append('password', info.password);
    data.append('birthday', info.birthday);
    data.append('photo', info.file);

    return data;
  }

  /**
   * Загрузка картинки на страницу
   */
  loadPhoto () {
    const file = this.element.querySelector(
      '.settings_file'
    ) as HTMLInputElement;

    const image = this.element.querySelector(
      '.settings__img'
    ) as HTMLImageElement;
    // @ts-ignore
    if (file?.files?.length > 0) {
      // @ts-ignore
      if (!file.files[0]?.type?.startsWith('image/')) {
        this.insertErrors(
          'Ошибка: Загруженный файл не является изображением!',
          <HTMLElement | null> this.element.querySelector('.error-image')
        );
        return;
      } else {
        this.removeError({ image: this.errorsHTML['image'] });
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.target && e.target.result) {
          image.src = `${e.target.result}`;
        }
      };

      if (file.files && file.files[0]) {
        this.file = file.files[0];
        reader.readAsDataURL(file.files[0]);
      }
    }
  }

  /**
   * Метод валидации данных
   * @param login
   * @param password
   * @param passwordSecond
   * @param email
   * @param file
   * @param birthday
   */
  validateForm (login, password, passwordSecond, email, file, birthday) {
    const elements = this.errorsHTML;
    const object = this.userInfo;
    const wraps = this.wraps;
    const birthdayResult = dateConverter(birthday);
    let result = true;

    if (
      object['login'] === login &&
      object['email'] === email &&
      password === '' &&
      passwordSecond === '' &&
      file === undefined &&
      object['birthday'] === birthdayResult
    ) {
      insertText(elements, 'Ничего не изменено');
      addErrorsActive(wraps);
      return false;
    }

    if ((file && file?.type?.startsWith('image/')) || file === undefined) {
    } else {
      insertText(
        document.querySelector('.error-image'),
        'Ошибка: Загруженный файл не является изображением'
      );
      result = false;
    }

    const settingsFile = document.querySelector(
      '.settings_file'
    ) as HTMLElement;
    // @ts-ignore
    settingsFile.value = null;

    if (!login) {
      insertText(elements['login'], errorInputs.NotAllElement);
      addErrorsActive(wraps['login']);
      result = false;
    }

    if (!email) {
      insertText(elements['email'], errorInputs.NotAllElement);
      addErrorsActive(wraps['email']);
      result = false;
    }

    if ((!password && passwordSecond) || (password && !passwordSecond)) {
      insertText(
        [elements['passwordFirst'], elements['passwordSecond']],
        errorInputs.NotAllElement
      );

      addErrorsActive([wraps['passwordFirst'], wraps['passwordSecond']]);
      result = false;
    } else {
      const passwordValidate = validatePassword(password);
      if (!passwordValidate.result && password.length > 0) {
        insertText(elements['passwordFirst'], passwordValidate.error);
        addErrorsActive(wraps['passwordFirst']);
        result = false;
      }
    }

    if (!birthdayResult) {
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

    if (!validateEmail(email) && email.length > 0) {
      insertText(elements['email'], errorInputs.EmailNoValid);
      result = false;
    }

    const loginValidate = validateLogin(login);
    if (!loginValidate.result && login.length > 0) {
      insertText(elements['login'], loginValidate.error);
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
   * Метод удаления всех ошибок
   */
  clearAllErrors () {
    removeErrors(this.errorsHTML);
    removeErrorsActive(this.wraps);
  }

  /**
   * Метод удаления ошибок
   * @param data
   */
  removeError (data) {
    removeErrors(data);
  }

  /**
   * Метод добавления ошибок
   * @param errorText
   * @param HTMLElement
   */
  insertErrors (errorText, HTMLElement) {
    if (HTMLElement) {
      insertText(HTMLElement, errorText);
    } else {
      insertText(this.errorsHTML, errorText);
    }
  }

  /**
   * Добавление элементов
   */
  addElements () {
    const loginText = this.element.querySelector('.login-text');
    const passwordFirstText = this.element.querySelector('.login-first-text');
    const passwordSecondText = this.element.querySelector('.login-second-text');
    const dateText = this.element.querySelector('.date-text');
    const emailText = this.element.querySelector('.email-text');
    const buttons = this.element.querySelector('.user-data-buttons');

    loginText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'login', module: 'user-data' })
    );

    passwordFirstText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'password-first',
        module: 'user-data',
        type: 'password'
      })
    );
    passwordSecondText!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'password-second',
        module: 'user-data',
        type: 'password'
      })
    );
    dateText?.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'birthday',
        module: 'user-data',
        type: 'date'
      })
    );
    emailText?.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'email', module: 'user-data' })
    );

    buttons?.insertAdjacentHTML(
      'beforeend',
      buttonSubmit.render({ text: 'Сохранить' })
    );
  }

  /**
   * Запрет редактирования настроек
   */
  cancelEdit () {
    const password1 = this.element.querySelector(
      '.password-first'
    ) as HTMLElement;
    const password2 = this.element.querySelector(
      '.password-second'
    ) as HTMLElement;
    const warning = this.element.querySelector(
      '.change-user-data__form-warning'
    ) as HTMLElement;
    const inputAll = this.element.querySelectorAll('.input-button');
    const text1 = this.element.querySelector(
      '.login-first-text'
    ) as HTMLElement;
    const text2 = this.element.querySelector(
      '.login-second-text'
    ) as HTMLElement;
    const changeImage = this.element.querySelector(
      '.change-user-data__form__file'
    ) as HTMLElement;
    const save = this.element.querySelector('.button-submit') as HTMLElement;

    text1.style.display = 'none';
    text2.style.display = 'none';
    warning.style.display = 'none';
    password1.style.display = 'none';
    password2.style.display = 'none';
    save.style.display = 'none';
    changeImage.style.display = 'none';
    inputAll.forEach((elem: HTMLElement) => {
      elem.style.pointerEvents = 'none';
    });
  }

  /**
   * Разрешение редактирования настроек
   */
  applyEdit () {
    const password1 = this.element.querySelector(
      '.password-first'
    ) as HTMLElement;
    const password2 = this.element.querySelector(
      '.password-second'
    ) as HTMLElement;
    const inputAll = this.element.querySelectorAll('.input-button');
    const warning = this.element.querySelector(
      '.change-user-data__form-warning'
    ) as HTMLElement;
    const text1 = this.element.querySelector(
      '.login-first-text'
    ) as HTMLElement;
    const text2 = this.element.querySelector(
      '.login-second-text'
    ) as HTMLElement;
    const changeImage = this.element.querySelector(
      '.change-user-data__form__file'
    ) as HTMLElement;
    const save = this.element.querySelector('.button-submit') as HTMLElement;

    text1.style.display = 'block';
    text2.style.display = 'block';
    warning.style.display = 'block';
    password1.style.display = 'flex';
    password2.style.display = 'flex';
    save.style.display = 'block';
    changeImage.style.display = 'flex';
    inputAll.forEach((elem: HTMLElement) => {
      elem.style.pointerEvents = 'auto';
    });
  }

  /**
   * Метод инициализации ссылок на элементы
   */
  init () {
    const loginHTML = this.element.querySelector('.login-input-user-data');
    const emailHTML = this.element.querySelector('.email-input-user-data');
    const passwordFirstHTML = this.element.querySelector(
      '.password-first-input-user-data'
    );
    const passwordSecondHTML = this.element.querySelector(
      '.password-second-input-user-data'
    );
    const birthdayHTML = this.element.querySelector(
      '.birthday-input-user-data'
    );

    const wrapLogin = this.element.querySelector('.wrap.login');
    const wrapEmailHTML = this.element.querySelector('.wrap.email');
    const wrapPassword = this.element.querySelector('.wrap.password-first');
    const wrapSecondPassword = this.element.querySelector(
      '.wrap.password-second'
    );
    const wrapBirthdayHTML = this.element.querySelector('.wrap.birthday');

    const fileInputHTML = this.element.querySelector('.settings_file');

    const loginError = this.element.querySelector('.error-login');
    const passwordFirstError = this.element.querySelector(
      '.error-password-first'
    );
    const passwordSecondError = this.element.querySelector(
      '.error-password-second'
    );
    const emailError = this.element.querySelector('.error-email');
    const dateError = this.element.querySelector('.error-birthday');
    const imageError = this.element.querySelector('.error-image');

    this.inputsHTML = {
      login: loginHTML,
      email: emailHTML,
      passwordFirst: passwordFirstHTML,
      passwordSecond: passwordSecondHTML,
      birthday: birthdayHTML,
      file: fileInputHTML
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
      birthday: dateError,
      image: imageError
    };
  }

  /**
   * Метод получения данных из инпутов
   * @param userInfo
   */
  getUserInfo (userInfo) {
    this.userInfo = {
      userSettings: true,
      header: userInfo.name,
      email: userInfo.email,
      birthday: dateConverter(userInfo.birthday),
      login: userInfo.login,
      poster: userInfo.photo,
      infoText: userInfo.info_text,
      country: userInfo.country,
      career: userInfo.career
    };
  }

  /**
   * Метод установления данных в инпуты
   */
  setUserInfo () {
    const photo = this.element.querySelector(
      '.settings__img'
    ) as HTMLImageElement;
    photo.src = this.userInfo.poster;
    insertInInput(this.inputsHTML, this.userInfo);
  }
}
