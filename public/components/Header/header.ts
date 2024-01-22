import { Component } from '@components/component';
import * as templateHeader from '@components/Header/header.hbs';
import { config, responseStatus } from '@utils/config';
import { store } from '@store/store';
import { actionLogout } from '@store/action/actionTemplates';
import { isMobile, isPush } from '@utils/std';

export interface Header {
  state: {
    config: any;
    isAuth: boolean;
    selectSearch: string;
    dataSection: string;
    isMobile: boolean;
    isActiveArrow: boolean;
  };
}

/**
 * Класс создания верхней шапки
 * @class Header
 * @typedef {Header}
 */
export class Header extends Component {
  private eventFunc: (event) => void;
  private eventResize: (event) => void;

  /**
   * Конструктор для формирования родительского элемента
   * @class
   * @param ROOT
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      config: config.menu,
      isAuth: false,
      selectSearch: 'film',
      dataSection: '',
      isMobile: false,
      isActiveArrow: false
    };

    store.subscribe('auth', this.subscribeAuthStatus.bind(this));
    store.subscribe('login', this.subscribeLoginHeaderStatus.bind(this));
    store.subscribe('logoutStatus', this.subscribeLogoutStatus.bind(this));
  }

  /**
   * Разбивает конфиг на определенные элементы, которые подставляются в шаблон
   * @readonly
   * @type {Array}
   */
  get items () {
    return Object.entries(this.state.config).map(
      // @ts-expect-error
      ([key, { href, png_name, name }]) => ({
        key,
        href,
        png_name,
        name
      })
    );
  }

  /**
   * Рендер шапки для незарегистрированного пользователя
   * @return {string} - html шапки
   */
  render () {
    const isAuthorized = this.state.isAuth;

    const [brand, signin, basket, profile, selection] = [
      'main',
      'signin',
      'basket',
      'profile',
      'selection'
    ].map((key) => this.items.find((item) => item.key === key));

    const htmlString = templateHeader({
      isAuthorized,
      signin,
      basket,
      profile,
      selection,
      brand
    });

    this.element = this.createHTMLElement(htmlString, 'header');
    this.componentDidMount();
    return this.element;
  }

  /**
   * Рендер шапки для зарегистрированного пользователя
   */
  componentDidMount () {
    this.eventFunc = (event) => {
      const target = event.target;
      const element = this.element;

      if (!element) {
        console.error('Header not found');
        return;
      }

      this.windowResizeEvent();

      switch (true) {
        case isPush(event, '.header_login-header'):
          this.renderNewPage('/login');
          break;
        case isPush(event, '.header_brand-header'):
          this.renderNewPage('/');
          break;
        case isPush(event, '.header_logout-header'):
          store.dispatch(actionLogout({ redirect: true }));
          break;
        case isPush(event, '.header_settings-header'):
          this.renderNewPage('/settings');
          break;
        case isPush(event, '.header_basket-item'):
          this.renderNewPage('/watchlist/films');
          break;
        case isPush(event, '.header__search-mobile__input__cancel'):
          const inputMobile = element?.querySelector('.header__search-mobile');
          const selectNew = element?.querySelector(
            '.header__search-mobile__select'
          );
          const imageStrelkaNew = element?.querySelector(
            '.header_search_item__select-search__arrow'
          ) as HTMLImageElement;
          imageStrelkaNew!.style.transform = 'rotateX(0deg)';
          this.removeSearchList(
            element?.querySelector('.header__search-mobile__select__list')
          );
          selectNew?.classList.remove('active');
          inputMobile?.classList.add('reverse');
          break;
        case isPush(event, '.header_search_item__mobile-lope'):
          const inputSearchMobile: HTMLElement | null = element?.querySelector(
            '.header__search-mobile'
          );
          inputSearchMobile?.classList.remove('reverse');
          inputSearchMobile!.style.display = 'flex';
          break;
        case isPush(event, '.header_user-statistic-header'):
          this.renderNewPage('/userStatistic');
          break;
        case isPush(event, '.header_search_item__all-search-container') ||
          isPush(event, '.header__search-mobile__input__all-search'):
          this.renderNewPage('/selection');
          break;
        case isPush(event, '.header_search_item__lope'):
          this.searchInfo(
            '.header_search_item__input',
            this.state.selectSearch
          );
          break;
        case isPush(event, '.header_search_item__mobile-lope-search'):
          this.searchInfo(
            '.header__search-mobile__input',
            this.state.selectSearch
          );
          break;
        case isPush(event, '.header_search_item__select-search'):
          this.state.isMobile = false;
          const films: HTMLElement | null = element.querySelector(
            '.films-search-header'
          );
          const imageStrelka = element.querySelector(
            '.header_search_item__select-search__arrow-header'
          ) as HTMLImageElement;
          const actors: HTMLElement | null = element.querySelector(
            '.actors-search-header'
          );

          if (target.closest('.header_search__list-search__films')) {
            this.state.selectSearch = 'film';
            films!.style.display = 'block';
            actors!.style.display = 'none';
          } else if (target.closest('.header_search__list-search__actors')) {
            this.state.selectSearch = 'actor';
            films!.style.display = 'none';
            actors!.style.display = 'block';
          }

          if (!this.state.isActiveArrow) {
            this.arrowUp(imageStrelka);
            this.state.isActiveArrow = true;
            this.addSearchList(
              element.querySelector('.header_search__list-search')
            );
          } else {
            this.arrowDown(imageStrelka);
            this.state.isActiveArrow = false;
            this.removeSearchList(
              element.querySelector('.header_search__list-search')
            );
          }
          break;
        case isPush(event, '.header__search-mobile__select'):
          this.state.isMobile = true;
          const inputButtonMobile: HTMLInputElement | null =
            element.querySelector('.header__search-mobile__input');
          const imageStrelkaMobile: HTMLImageElement | null =
            element.querySelector('.header_search_item__select-search__arrow');

          if (target.closest('.header__search-mobile__select__films')) {
            this.state.selectSearch = 'film';
            inputButtonMobile!.placeholder = 'Фильмы';
          } else if (target.closest('.header__search-mobile__select__actors')) {
            this.state.selectSearch = 'actor';
            inputButtonMobile!.placeholder = 'Актёры';
          }

          if (!this.state.isActiveArrow) {
            this.arrowUp(imageStrelkaMobile);
            this.state.isActiveArrow = true;
            this.addSearchList(
              element.querySelector('.header__search-mobile__select__list')
            );
          } else {
            this.arrowDown(imageStrelkaMobile);
            this.state.isActiveArrow = false;
            this.removeSearchList(
              element.querySelector('.header__search-mobile__select__list')
            );
          }
          break;
        default:
          break;
      }
    };
    this.element.addEventListener('click', this.eventFunc);

    if (isMobile()) {
      this.element
        .querySelector('.header__search-mobile')
        ?.addEventListener('touchmove', function (e) {
          e.preventDefault();
          // eslint-disable-next-line no-invalid-this
          this.style.display = 'none';
        });
    }
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    this.element.removeEventListener('click', this.eventFunc);
    window.removeEventListener('resize', this.eventResize);
  }

  /**
   * Добавление эвента на изменение версии пк на мобильную при изменении размера экрана
   */
  windowResizeEvent () {
    this.eventResize = () => {
      const width = document.body.clientWidth;
      if (width > 800) {
        const mobile = this.element.querySelector(
          '.header__search-mobile'
        ) as HTMLElement;
        mobile.style.display = 'none';
      }
    };
    window.addEventListener('resize', this.eventResize);
  }

  /**
   * Подписка на результат статуса авторизации
   */
  subscribeAuthStatus () {
    this.state.isAuth =
      store.getState('auth')?.status === responseStatus.success;
    this.changeHeader();
  }

  /**
   * Подписка на результат статуса login
   */
  subscribeLoginHeaderStatus () {
    this.state.isAuth =
      store.getState('login')?.status === responseStatus.success;
    this.changeHeader();
  }

  /**
   * Подписка на результат статуса logout
   */
  subscribeLogoutStatus () {
    this.state.isAuth =
      store.getState('logoutStatus') !== responseStatus.success;
    this.changeHeader();
  }

  /**
   * Изменение шапки при изменении статуса авторизации
   */
  changeHeader () {
    const current: HTMLElement | null =
      this.element.querySelector('.header_dropdown');
    const all: HTMLElement | null = this.element.querySelector(
      '.header_login-header'
    );

    if (this.state.isAuth) {
      current!.style.display = 'flex';
      all!.style.display = 'none';
    } else {
      current!.style.display = 'none';
      all!.style.display = 'flex';
    }
  }

  /**
   * Добавить лист поиска
   * @param elementHTML
   */
  addSearchList (elementHTML) {
    elementHTML!.style.display = 'block';
  }

  /**
   * Удалить лист поиска
   * @param elementHTML
   */
  removeSearchList (elementHTML) {
    elementHTML!.style.display = 'none';
  }

  /**
   * Поднять стрелку
   * @param imageStrelkaMobile
   */
  arrowUp (imageStrelkaMobile) {
    imageStrelkaMobile!.style.transform = 'rotateX(180deg)';
  }

  /**
   * Опустить стрелку
   * @param imageStrelkaMobile
   */
  arrowDown (imageStrelkaMobile) {
    imageStrelkaMobile!.style.transform = 'rotateX(0deg)';
  }

  /**
   * Поиск фильма/актера по данным
   * @param HTMLString
   * @param selected
   */
  searchInfo (HTMLString, selected) {
    const lope = (this.element.querySelector(HTMLString) as HTMLInputElement)
      ?.value;

    if (selected === 'film') {
      this.renderNewPage(
        '/films',
        `?title=${lope}&date_from=&date_to=&rating_from=&rating_to=&mpaa=&genre=&actors=`
      );
    } else {
      this.renderNewPage(
        '/actors',
        `?name=${lope}&amplua=&country=&birthday=&films=`
      );
    }
  }
}
