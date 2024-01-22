import { View } from '@views/view';
import { collections, ROOT } from '@utils/config';
import { router } from '@router/router';
import { store } from '@store/store';
import { image } from '@components/Image/image';
import { inputButton } from '@components/inputButton/inputButton';
import { addActive, isPush, removeActive } from '@utils/std';
import {
  actionSearchActor,
  actionSearchFilm
} from '@store/action/actionTemplates';
import { SelectCollection } from '@components/SelectCollection/selectCollection';

export interface SelectCollectionPage {
  state: {
    firstSearchActor: boolean;
    firstSearchFilm: boolean;
    dataSection: string;
    renderedSearchFilm: boolean;
  };
}

/**
 * Класс формирования окна выбора подборки фильмов и актёров
 * @class SelectCollectionPage
 * @typedef {SelectCollectionPage}
 */
export class SelectCollectionPage extends View {
  private popupEvent: (event) => void;
  private panelEvent: (event) => void;
  private selectComponent;

  /**
   * Конструктор класса
   * @param ROOT
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      dataSection: '',
      firstSearchActor: true,
      firstSearchFilm: true,
      renderedSearchFilm: true
    };
  }

  /**
   * Метод создания страницы
   */
  render () {
    this.renderDefaultPage();
    this.element = <HTMLElement>ROOT?.querySelector('main');
    this.element.innerHTML = '';
    this.element?.insertAdjacentHTML('afterbegin', image.render({}));

    const icon = this.element.querySelector('.image-container') as HTMLElement;
    const iconsShadow = this.element.querySelector(
      '.header__container__shadow'
    ) as HTMLElement;

    icon!.style.backgroundImage = 'url("/icons/ocean.webp")';
    icon!.style.backgroundAttachment = 'fixed';
    iconsShadow!.style.backgroundAttachment = 'fixed';

    const containerHTML = this.element.querySelector('.image-container');
    const selectCollection = new SelectCollection(ROOT);
    this.selectComponent = selectCollection;
    containerHTML?.appendChild(selectCollection.render());
    this.componentDidMount();
  }

  /**
   * Метод обработки нажатий на выбранную коллекцию
   * @param searchFilm
   * @return {Promise} Promise ответа
   */
  componentDidMount (searchFilm = true) {
    this.addEvent();
  }

  /**
   * Метод добавление обработки событий
   */
  addEvent () {
    const containerHTML = this.element.querySelector('.search-container');
    this.panelEvent = (event) => {
      switch (true) {
        case isPush(event, '.result-button'):
          event.preventDefault();
          console.log(this.selectComponent.renderedSearchFilm, 'page');
          if (this.selectComponent.renderedSearchFilm) {
            this.subscribeSearchFilms();
          } else {
            this.subscribeSearchActors();
          }
          break;
        default:
          break;
      }
    };

    containerHTML?.addEventListener('click', this.panelEvent);
  }

  /**
   * Метод отписок
   */
  componentWillUnmount () {
    this.selectComponent.componentWillUnmount();
    const search = this.element.querySelector('.search-container');
    search?.removeEventListener('click', this.popupEvent);
  }

  /**
   * Метод для обработки ответа с фильмами
   */
  subscribeSearchFilms () {
    this.componentWillUnmount();
    this.renderNewPage(`/films`, `${this.selectComponent.getFilmsQuery()}`);
  }

  /**
   * Метод для обработки ответа с актерами
   */
  subscribeSearchActors () {
    this.componentWillUnmount();
    this.renderNewPage(`/actors`, `${this.selectComponent.getActorsQuery()}`);
  }
}
