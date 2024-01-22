import { Component } from '@components/component';
import * as templateDescriptionFilm from '@components/Description/description.hbs';
import { store } from '@store/store';
import { responseStatus } from '@utils/config';
import {
  actionAddFavoriteFilm,
  actionRemoveFavoriteFilm
} from '@store/action/actionTemplates';

/**
 * Класс рендеринга авторизации
 * @class Description
 * @typedef {Description}
 */
export class Description extends Component {
  private body;

  /**
   * Метод рендеринга элемента
   * @param result
   * @returns {string} html авторизации
   */
  render (result) {
    this.element = this.createHTMLElement(
      templateDescriptionFilm(this.getData(result)),
      '.film'
    );
    return this.element;
  }

  /**
   * Получение данных из ответа сервера
   * @param result
   */
  getData (result) {
    const { actors, rating, number, genre, film } = result;
    const { poster, title, country, release_date, info } = film;

    const fullDate = new Date(release_date);
    const date = fullDate.getFullYear().toString();

    result = {
      film: true,
      body: result,
      genre,
      actors,
      poster,
      country: country || 'Неизвестно',
      date: date || 'Неизвестно',
      title,
      infoText: info,
      header: 'О фильме',
      headerAbout: 'Описание',
      headerComment: 'Отзывы',
      isHeader: true,
      stars_burning: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ],

      mark: rating.toFixed(1),
      mark_number: number
    };
    return result;
  }

  /**
   * Метод изменения флажка на просмотренных/не просмотренный
   * @param filmId
   */
  changeFlagWatchList (filmId) {
    const element = this.element.querySelector(`.video-content`);
    const orange = element?.querySelector('.red-watchlist') as HTMLElement;
    const red = element?.querySelector('.orange-watchlist') as HTMLElement;

    let active = true;
    if (store.getState('auth').status === responseStatus.success) {
      if (element?.querySelector('.orange-watchlist.active')) {
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
    } else {
      this.renderNewPage('/login');
      return;
    }

    if (active) {
      store.dispatch(actionAddFavoriteFilm({ film_id: filmId }));
    } else {
      store.dispatch(actionRemoveFavoriteFilm({ film_id: filmId }));
    }

    return active;
  }
}
