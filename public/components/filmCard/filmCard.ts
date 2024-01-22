import { Component } from '@components/component';
import * as templateFilmCard from '@components/filmCard/filmCard.hbs';
import { store } from '@store/store';
import {
  actionAddFavoriteFilm,
  actionRemoveFavoriteFilm
} from '@store/action/actionTemplates';
import { isPush } from '@utils/std';
import { responseStatus } from '@utils/config';

/**
 * Класс рендеринга формирования подборки фильмов
 * @class FilmCard
 * @typedef {FilmCard}
 */
export class FilmCard extends Component {
  private filmId;
  private popupEvent;
  /**
   * Метод рендеринга элемента
   * @returns {string}
   * @param film.film
   * @param film.alreadyFavorite
   * @param film.haveRating
   * @param film.renderDelete
   * @param film.alreadyAdded
   * @param film
   */
  render ({
    film,
    alreadyFavorite,
    renderDelete,
    alreadyAdded,
    haveRating = false
  }) {
    const result = {
      id: film.id,
      title: film.title,
      poster: film.poster,
      rating: film.rating === undefined ? 8 : film.rating.toFixed(1),
      alreadyFavorite: alreadyFavorite,
      renderDelete: renderDelete,
      alreadyAdded: alreadyAdded,
      haveRating: haveRating
    };

    this.element = this.createHTMLElement(
      templateFilmCard(result),
      '.film-selection_film'
    );
    this.filmId = film.id;
    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.image-watchlist'):
          let active;
          const orange = this.element.querySelector(
            '.red-watchlist'
          ) as HTMLElement;
          const red = this.element.querySelector(
            '.orange-watchlist'
          ) as HTMLElement;
          if (this.element.querySelector('.orange-watchlist.active')) {
            active = true;
            red.classList.remove('active');
            red.classList.add('noactive');
            orange.classList.remove('noactive');
            orange.classList.add('active');
          } else {
            active = false;
            red.classList.remove('noactive');
            red.classList.add('active');
            orange.classList.remove('active');
            orange.classList.add('noactive');
          }

          if (store.getState('auth').status === responseStatus.success) {
            if (active) {
              store.dispatch(actionAddFavoriteFilm({ film_id: this.filmId }));
            } else {
              store.dispatch(
                actionRemoveFavoriteFilm({ film_id: this.filmId })
              );
            }
          } else {
            this.renderNewPage('/login');
          }
          break;
        case isPush(event, '.image-cancel'):
          store.dispatch(actionRemoveFavoriteFilm({ film_id: this.filmId }));
          this.element?.remove();
          break;
        case isPush(event, '.film-selection_film'):
          this.renderNewPage('/film', `/${this.filmId}`);
          break;
        default:
          break;
      }
    };

    this.element.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    this.element.removeEventListener('click', this.popupEvent);
  }
}
