import { View } from '@views/view';
import { responseStatus, ROOT } from '@utils/config';
import { FavoriteList } from '@components/FavoriteList/favoriteList';
import { store } from '@store/store';
import {
  actionFavoriteActors,
  actionFavoriteFilms,
  actionRemoveFavoriteActor,
  actionRemoveFavoriteFilm
} from '@store/action/actionTemplates';
import { addActive, isPush, removeActive } from '@utils/std';
import { searchData } from '@utils/searchData';

export interface FavoritePage {
  state: {
    pageNumber: number;
    perPage: number;
  };
}

/**
 * Класс формирования окна сохранённых подборок фильмов и актёров
 * @class FavoritePage
 * @typedef {FavoritePage}
 */
export class FavoritePage extends View {
  private popupEvent: (event) => void;
  private isFilm = true;
  /**
   * Конструктор для формирования родительского элемента
   * @param ROOT
   * @class
   */
  constructor (ROOT) {
    super(ROOT);

    this.state = {
      pageNumber: 1,
      perPage: 20
    };

    store.subscribe('favoriteFilms', this.subscribeFavoriteFilms.bind(this));
    store.subscribe('favoriteActors', this.subscribeFavoriteActor.bind(this));
  }

  /**
   * Метод создания страницы
   */
  render () {
    this.renderDefaultPage();
    this.element = document.querySelector('.content-block') as HTMLElement;
    this.element.style.display = 'flex';

    if (window.location.pathname === '/watchlist/films') {
      const favoriteList = new FavoriteList(ROOT);
      this.element?.appendChild(
        favoriteList.render({
          title: 'Список фильмов',
          redirect: 'Любимые актёры'
        })
      );

      store.dispatch(
        actionFavoriteFilms({
          page: this.state.pageNumber++,
          per_page: this.state.perPage
        })
      );
      return;
    }

    if (window.location.pathname === '/watchlist/actors') {
      const favoriteList = new FavoriteList(ROOT);
      this.element?.appendChild(
        favoriteList.render({
          title: 'Список актёров',
          redirect: 'Любимые фильмы'
        })
      );

      store.dispatch(
        actionFavoriteActors({
          page: this.state.pageNumber++,
          per_page: this.state.perPage
        })
      );
    }
  }

  /**
   * Метод обработки нажатий
   */
  componentDidMount () {
    this.popupEvent = (event) => {
      const filmId = event.target
        .closest('.film-selection_film')
        ?.getAttribute('data-section');
      const actorId = event.target
        .closest('.actor-selection_actor')
        ?.getAttribute('data-section');

      switch (true) {
        case isPush(event, '.image-cancel'):
          const elementsWithDataSetion = this.element.querySelectorAll(
            '.actor-selection_actor '
          );
          const elementsFilms = this.element.querySelectorAll(
            '.film-selection_film'
          );

          if (
            elementsWithDataSetion.length === 0 &&
            elementsFilms.length === 0
          ) {
            const body = this.element.querySelector('.favorite__body');
            body!.innerHTML = '<div>Ваш список пуст</div>';
            removeActive(this.element.querySelector('.more-elements'));
          }
          break;
        case isPush(event, '.redirect-to-favorite'):
          this.componentWillUnmount();
          if (this.isFilm) {
            this.renderNewPage('/watchlist/actors');
          } else {
            this.renderNewPage('/watchlist/films');
          }
          break;
        case isPush(event, '.more-elements'):
          if (this.isFilm) {
            store.dispatch(
              actionFavoriteFilms({
                page: this.state.pageNumber++,
                per_page: this.state.perPage
              })
            );
          } else {
            store.dispatch(
              actionFavoriteActors({
                page: this.state.pageNumber++,
                per_page: this.state.perPage
              })
            );
          }
          break;
        default:
          break;
      }
    };

    const favorites = this.element.querySelector('.favorite');
    favorites?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод отписок
   */
  componentWillUnmount () {
    const elements = this.element.querySelector('.favorite');
    elements?.removeEventListener('click', this.popupEvent);

    store.unsubscribe('favoriteFilms', this.subscribeFavoriteFilms.bind(this));
    store.unsubscribe('favoriteActors', this.subscribeFavoriteActor.bind(this));
  }

  /**
   * Метод для обработки ответа с фильмами
   */
  subscribeFavoriteFilms () {
    this.componentDidMount();
    this.isFilm = true;
    const more = this.element.querySelector('.more-elements');
    const films = store.getState('favoriteFilms')?.body;
    const status = store.getState('favoriteFilms')?.status;

    const contentBlockHTML = document.querySelector(
      '.favorite__body'
    ) as HTMLElement;

    const body = this.element.querySelector('.favorite__body');

    if (
      (films?.length === 0 || status === responseStatus.notFound) &&
      this.state.pageNumber === 2
    ) {
      body?.insertAdjacentHTML('beforeend', '<div>Ваш список пуст</div>');
      removeActive(this.element.querySelector('.more-elements'));
      return;
    } else if (status !== responseStatus.success) {
      body?.insertAdjacentHTML('beforeend', '<div>Ошибка сервера!</div>');
      removeActive(this.element.querySelector('.more-elements'));
      return;
    }

    films.forEach((value) => {
      contentBlockHTML?.appendChild(
        <HTMLElement>searchData.addFilmsToHTML([value], true)[0]
      );
    });

    if (films.length >= this.state.perPage) {
      addActive(more);
    } else {
      removeActive(more);
    }
  }

  /**
   * Метод для обработки ответа с актерами
   */
  subscribeFavoriteActor () {
    this.componentDidMount();
    this.isFilm = false;
    const contentBlockHTML = this.element.querySelector(
      '.favorite__body'
    ) as HTMLElement;
    const actors = store.getState('favoriteActors')?.body.actors;
    const status = store.getState('favoriteActors')?.status;
    const more = this.element.querySelector('.more-elements');

    if (
      (actors?.length === 0 || status === responseStatus.notFound) &&
      this.state.pageNumber === 2
    ) {
      contentBlockHTML?.insertAdjacentHTML(
        'beforeend',
        '<div>Ваш список пуст</div>'
      );
      removeActive(this.element.querySelector('.more-elements'));
      return;
    } else if (status !== responseStatus.success) {
      contentBlockHTML?.insertAdjacentHTML(
        'beforeend',
        '<div>Ошибка сервера!</div>'
      );
      removeActive(this.element.querySelector('.more-elements'));
      return;
    }

    actors.forEach((value) => {
      contentBlockHTML?.appendChild(
        <HTMLElement>searchData.addActorsToHTML([value], true)[0]
      );
    });

    if (actors.length >= this.state.perPage) {
      addActive(more);
    } else {
      removeActive(more);
    }
  }
}
