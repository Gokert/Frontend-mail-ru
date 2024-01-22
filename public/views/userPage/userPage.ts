import { View } from '@views/view';
import { errorInputs, responseStatus, ROOT } from '@utils/config';
import { store } from '@store/store';
import {
  actionCSRF,
  actionGetSettings,
  actionLogout,
  actionPutSettings
} from '@store/action/actionTemplates';
import { addErrorsActive, insertText, returnError } from '@utils/addError';
import { router } from '@router/router';
import { image } from '@components/Image/image';
import { Settings } from '@components/Settings/settings';
import { isPush } from '@utils/std';

export interface UserPage {
  state: {
    isEdit: boolean;
    userStatus: Number;
  };
}

/**
 * Класс формирование страницы фильма
 * @class UserPage
 * @typedef {UserPage}
 */
export class UserPage extends View {
  private popupEvent: (event) => void;
  private settingComponent: Settings;

  /**
   * Конструктор класса
   * @param ROOT
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      isEdit: false,
      userStatus: 0
    };

    store.subscribe('getSettingsStatus', this.subscribeGetStatus.bind(this));
    store.subscribe('postStatusSettings', this.subscribePostStatus.bind(this));
  }

  /**
   * Метод создания страницы
   */
  render () {
    this.renderDefaultPage();
    store.dispatch(actionGetSettings());
    this.element = <HTMLElement>document.querySelector('main');

    this.settingComponent = new Settings(ROOT);
    this.element.appendChild(this.settingComponent.render());

    const descHTML = this.element.querySelector('.settings');
    this.element?.insertAdjacentHTML('afterbegin', image.render({}));

    const icon = this.element.querySelector('.image-container') as HTMLElement;
    icon!.style.backgroundImage = 'url("/icons/loginImage.webp")';

    const containerHTML = this.element.querySelector('.image-container');
    containerHTML?.appendChild(descHTML!);

    this.componentDidMount();
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    const blockHTML = this.element.querySelector('.settings');
    this.state.isEdit = false;
    this.settingComponent.cancelEdit();

    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.settings_file'):
          this.settingComponent.loadPhoto();
          break;
        case isPush(event, '.change-user-data__form__pencil'):
          if (this.state.isEdit) {
            this.state.isEdit = false;
            this.settingComponent.cancelEdit();
          } else {
            this.state.isEdit = true;
            this.settingComponent.applyEdit();
          }
          break;
        case isPush(event, '.button-submit'):
          event.preventDefault();
          this.settingComponent.clearAllErrors();
          this.submit();
          break;
        default:
          break;
      }
    };

    blockHTML?.addEventListener('click', this.popupEvent);
    blockHTML?.addEventListener('change', this.popupEvent);
  }

  /**
   * Метод отправки изменённых данных
   */
  submit () {
    const elements = this.settingComponent.getData();
    const data = this.settingComponent.getFormData();

    if (
      this.settingComponent.validateForm(
        elements.login,
        elements.password,
        elements.passwordSecond,
        elements.email,
        elements.file,
        elements.birthday
      )
    ) {
      store.dispatch(actionPutSettings({ file: data })).then((response) => {
        if (response!['postStatusSettings'].status === responseStatus.success) {
          this.settingComponent.setUserInfo();
          if (elements.login !== this.settingComponent.userInfo['login']) {
            store.dispatch(actionLogout({ redirect: true }));
          } else {
            router.refresh();
          }
        }
      });
    }
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    const popup = this.element.querySelector('.content-block');
    popup?.removeEventListener('click', this.popupEvent);
    popup?.removeEventListener('change', this.popupEvent);

    store.unsubscribe('getSettingsStatus', this.subscribeGetStatus.bind(this));
    store.unsubscribe(
      'postStatusSettings',
      this.subscribePostStatus.bind(this)
    );
    this.settingComponent.ComponentWillUnmount();
  }

  /**
   * Проверка статуса результата
   */
  handlerStatus () {
    const errorClassName = 'change-user-data__error';
    switch (this.state.userStatus) {
      case responseStatus.success:
        return true;
      case responseStatus.notAuthorized:
        this.renderNewPage('/login');
        break;
      case responseStatus.alreadyExists:
        const elements = this.settingComponent.errorsHTML;
        const wraps = this.settingComponent.wraps;
        returnError(errorInputs.repeatPassword, errorClassName);
        insertText(
          [elements['passwordFirst'], elements['passwordSecond']],
          <string>errorInputs.repeatPassword
        );
        addErrorsActive([wraps['passwordFirst'], wraps['passwordSecond']]);
        break;
      case responseStatus.csrfError:
        store.dispatch(actionCSRF()).then((response) => {
          store.dispatch(
            actionPutSettings({
              file: this.settingComponent.userInfo['fileData']
            })
          );
        });

        break;
      default:
        returnError(errorInputs.LoginOrPasswordError, errorClassName);
        break;
    }
    return false;
  }

  /**
   * Подписка на получение результата post запроса
   */
  subscribePostStatus () {
    this.state.userStatus = store.getState('postStatusSettings').status;
    this.handlerStatus();
  }

  /**
   * Подписка на получение результата пуе запроса
   */
  subscribeGetStatus () {
    const result = store.getState('getSettingsStatus');
    this.state.userStatus = result.status;

    if (!this.handlerStatus()) {
      return;
    }

    const userInfo = result.body;
    if (userInfo) {
      this.settingComponent.getUserInfo(userInfo);
    }

    this.settingComponent.setUserInfo();
  }
}
