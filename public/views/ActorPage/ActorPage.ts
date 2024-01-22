import { View } from '@views/view';
import { store } from '@store/store';
import {
  actionActor,
  actionAddFavoriteActor,
  actionAddFavoriteFilm,
  actionRemoveFavoriteActor,
  actionRemoveFavoriteFilm
} from '@store/action/actionTemplates';
import { image } from '@components/Image/image';
import { ActorInfo } from '@components/ActorInfo/actorInfo';
import { isPush } from '@utils/std';
import { responseStatus, ROOT } from '@utils/config';

export interface ActorDescritionPage {
  state: {
    actorInfo: null;
  };
}

/**
 * Класс формирования главной страницы
 * @class ActorDescritionPage
 * @typedef {ActorDescritionPage}
 */
export class ActorDescritionPage extends View {
  private popupEvent;
  private actorComponent;

  /**
   * Конструктор класса
   * @param ROOT
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      actorInfo: null
    };
  }

  /**
   * Метод создания страницы
   * @param props
   */
  render (props) {
    this.renderDefaultPage();
    this.element = <HTMLElement>document.querySelector('main');
    store.subscribe('removeView', this.componentWillUnmount.bind(this));
    store.subscribe('actorInfo', this.subscribeActorStatus.bind(this));

    if (props !== null) {
      store.dispatch(
        actionActor({ actorName: parseInt(props.replace('/', '')) })
      );
    }
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addElements();
    this.addEvents();
  }

  /**
   * Метод добавления элементов
   */
  addElements () {
    let result;
    const res = this.state.actorInfo;

    if (res) {
      result = this.createActorData(res);
    }

    this.element!.innerHTML = '';
    this.element?.insertAdjacentHTML('afterbegin', image.render({}));

    const icon = this.element.querySelector('.image-container') as HTMLElement;
    const iconsShadow = this.element.querySelector(
      '.header__container__shadow'
    ) as HTMLElement;
    icon!.style.backgroundImage = 'url("' + result.poster + '")';

    icon!.style.backgroundAttachment = 'fixed';
    iconsShadow!.style.backgroundAttachment = 'fixed';

    const containerHTML = this.element.querySelector('.image-container');
    const actorInfo = new ActorInfo(ROOT);
    this.actorComponent = actorInfo;
    containerHTML?.appendChild(actorInfo.render(result));
  }

  /**
   * Метод добавления обработчика событий
   */
  addEvents () {
    this.popupEvent = (event) => {
      event.preventDefault();
      switch (true) {
        case isPush(event, '.image-watchlist'):
          this.changeFavorite();
          break;
        default:
          break;
      }
    };

    const popup = this.element.querySelector('.video-content');
    popup?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод добавления/удаления из фаворитов
   */
  changeFavorite () {
    // @ts-ignore
    const id = parseInt(location.pathname.match(/\d+/)[0]);
    this.actorComponent.changeFavorite(id);
  }

  /**
   * Получение данных для инициализауии данных
   * @param res
   */
  createActorData (res) {
    const dateTime = new Date(res['birthday']);
    const year = dateTime.getFullYear();
    const month = ('0' + (dateTime.getMonth() + 1)).slice(-2);
    const day = ('0' + dateTime.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    return {
      actor: true,
      isHeader: true,
      header: res['name'],
      title: 'Основная информация',
      headerAbout: 'Биография',
      date: formattedDate,
      poster: res['poster_href'],
      infoText: res['info_text'] ? res['info_text'] : 'Неизвестно',
      country: res['country'] ? res['country'] : 'Неизвестно',
      career: res['career']
    };
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    store.unsubscribe('removeView', this.subscribeActorStatus.bind(this));
    store.unsubscribe('actorInfo', this.subscribeActorStatus.bind(this));
    const popup = this.element.querySelector('.video-content');
    popup?.removeEventListener('click', this.popupEvent);
  }

  /**
   * Подписка на получение информации об актёре
   */
  subscribeActorStatus () {
    this.state.actorInfo = store.getState('actorInfo');
    this.componentDidMount();
  }
}
