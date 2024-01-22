import { View } from '@views/view';
import { store } from '@store/store';
import { responseStatus, ROOT } from '@utils/config';
import {
  actionSearchActor,
  actionSearchFilm
} from '@store/action/actionTemplates';
import { FilmSelection } from '@components/FilmSelection/filmSelection';
import { addActive, isPush, removeActive } from '@utils/std';
import { searchData } from '@utils/searchData';

export interface FilmSelectionPage {
  state: {
    dataSection: string;
    current: string;
    pageNumber: number;
    perPage: number;
  };
}

/**
 * Класс формирования подборки фильмов
 * @class FilmSelectionPage
 * @typedef {FilmSelectionPage}
 */

export class FilmSelectionPage extends View {
  private popupEvent: (event) => void;

  constructor (ROOT) {
    super(ROOT);
    this.state = {
      dataSection: '',
      current: 'none',
      pageNumber: 1,
      perPage: 20
    };
  }

  /**
   * Метод рендеринга элемента
   */
  render () {
    this.renderDefaultPage();

    if (window.location.pathname === '/films') {
      store.subscribe('resultSearchFilm', this.addFilmToPage.bind(this));
      this.sendDataFilm(
        this.getDataFilmFromQuery(),
        this.state.pageNumber,
        this.state.perPage
      );
      if (!navigator.onLine) {
        console.error('offline');
        this.Offline();
      }
      this.componentDidMount(true);
    } else {
      store.subscribe('resultSearchActor', this.addActorsToPage.bind(this));
      this.sendDataActor(
        this.getDataActorFromQuery(),
        this.state.pageNumber,
        this.state.perPage
      );

      if (!navigator.onLine) {
        this.Offline();
      }
      this.componentDidMount(false);
    }
  }

  /**
   * Метод инициализации страницы
   * @param isFilms
   */
  componentDidMount (isFilms) {
    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.more-elements'):
          if (isFilms) {
            store.subscribe('resultSearchFilm', this.addFilmToPage.bind(this));
            this.sendDataFilm(
              this.getDataFilmFromQuery(),
              this.state.pageNumber,
              this.state.perPage
            );
          } else {
            store.subscribe(
              'resultSearchActor',
              this.addActorsToPage.bind(this)
            );
            this.sendDataActor(
              this.getDataFilmFromQuery(),
              this.state.pageNumber,
              this.state.perPage
            );
          }
          break;
        default:
          break;
      }
    };

    this.element = <HTMLElement>document.querySelector('.content-block');
    this.element?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    store.unsubscribe('resultSearchFilm', this.addFilmToPage.bind(this));
    store.unsubscribe('resultSearchActor', this.addActorsToPage.bind(this));
    this.element?.removeEventListener('click', this.popupEvent);
  }

  /**
   * Метод добавления актёров на страницу
   */
  addActorsToPage () {
    store.unsubscribe('resultSearchActor', this.addActorsToPage.bind(this));
    this.state.current = 'actor';

    const actors = store.getState('resultSearchActor')?.body?.actors;
    const filmSelect = new FilmSelection(ROOT);
    this.element?.appendChild(filmSelect.render());

    const contentBlock = this.element.querySelector('.film-selection_films');
    const more = this.element.querySelector('.more-elements');

    if (
      actors?.length === 0 ||
      store.getState('resultSearchActor')?.status === responseStatus.notFound
    ) {
      contentBlock?.insertAdjacentHTML(
        'beforeend',
        '<p>Ничего не найдено</p><img class="image404-ui" src="/icons/404image.webp" alt="">'
      );
      return;
    } else if (
      store.getState('resultSearchActor')?.status !== responseStatus.success
    ) {
      contentBlock?.insertAdjacentHTML(
        'beforeend',
        '<div>Ошибка сервера!</div>'
      );
      return;
    }

    const result = searchData.addActorsToHTML(actors);
    result.forEach((value) => {
      contentBlock?.appendChild(value);
    });

    if (actors.length >= this.state.perPage) {
      addActive(more);
    } else {
      removeActive(more);
    }

    if (this.state.pageNumber <= 2) {
      this.componentDidMount(false);
    }
  }

  /**
   * Метод добавления фильмов на страницу
   */
  addFilmToPage () {
    store.unsubscribe('resultSearchFilm', this.addFilmToPage.bind(this));
    this.state.current = 'film';

    const buf = store.getState('resultSearchFilm');
    if (buf === undefined || buf === null || buf.body === undefined) {
      return;
    }

    const filmSelect = new FilmSelection(ROOT);
    if (!this.element.querySelector('.film-selection')) {
      this.element?.appendChild(filmSelect.render());
    }

    const contentBlock = this.element.querySelector('.film-selection_films');
    const more = this.element.querySelector('.more-elements');
    if (
      buf?.body?.films?.length === 0 ||
      buf?.status === responseStatus.notFound
    ) {
      contentBlock?.insertAdjacentHTML(
        'beforeend',
        '<p>Ничего не найдено</p><img class="image404-ui" src="/icons/404image.webp" alt="">'
      );
      return;
    } else if (buf?.status !== responseStatus.success) {
      contentBlock?.insertAdjacentHTML(
        'beforeend',
        '<div>Ошибка сервера!</div>'
      );
      return;
    }

    const result = searchData.addFilmsToHTML(buf.body.films);
    result.forEach((value) => {
      contentBlock?.appendChild(value);
    });

    if (buf.body.films.length >= this.state.perPage) {
      addActive(more);
    } else {
      removeActive(more);
    }

    if (this.state.pageNumber <= 2) {
      this.componentDidMount(true);
    }
  }

  /**
   * Метод отправки запроса для поиска фильма
   * @param data
   * @param page
   * @param per_page
   */
  sendDataFilm (data, page, per_page) {
    store.dispatch(
      actionSearchFilm({
        title: data.title || '',
        dateFrom: data.dateFrom || '',
        dateTo: data.dateTo || '',
        ratingFrom: data.ratingFrom || 1,
        ratingTo: data.ratingTo || 10,
        mpaa: data.mpaa || '',
        genre: data.genre ? data.genre.split(',').map(Number) : [],
        actors: data.actors?.split(','),
        page: page,
        per_page: per_page
      })
    );
  }

  /**
   * Метод отправки запроса для поиска актёра
   * @param data
   * @param page
   * @param per_page
   */
  sendDataActor (data, page, per_page) {
    store.dispatch(
      actionSearchActor({
        name: data.name || '',
        amplua: data.amplua ? data.amplua?.split(',') : [''],
        county: data.country || '',
        birthday: data.birthday || '',
        films: data.films ? data.films?.split(',') : [''],
        page: page,
        per_page: per_page
      })
    );
  }

  /**
   * Метод получения по query данных для поиска фильма
   */
  getDataFilmFromQuery () {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const title = <string>searchParams.get('title');
    const dateFrom = <string>searchParams.get('date_from');
    const dateTo = <string>searchParams.get('date_to');
    const ratingFrom = Number(searchParams.get('rating_from'));
    const ratingTo = Number(searchParams.get('rating_to'));
    const mpaa = <string>searchParams.get('mpaa');
    const genre = searchParams.get('genre');
    const actors = searchParams.get('actors');

    return {
      title: title,
      dateFrom: dateFrom,
      dateTo: dateTo,
      ratingFrom: ratingFrom,
      ratingTo: ratingTo,
      mpaa: mpaa,
      genre: genre,
      actors: actors
    };
  }

  /**
   * Метод получения по query данных для поиска актёров
   */
  getDataActorFromQuery () {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const name = <string>searchParams.get('name');
    const amplua = <string>searchParams.get('amplua');
    const country = <string>searchParams.get('country');
    const birthday = <string>searchParams.get('birthday');
    const films = <string>searchParams.get('films');

    return {
      name: name,
      amplua: amplua,
      country: country,
      birthday: birthday,
      films: films
    };
  }

  /**
   * Метод рендера offline картинки
   */
  Offline () {
    this.renderDefaultPage();
    const filmSelect = new FilmSelection(ROOT);
    this.element?.appendChild(filmSelect.render(''));

    const contentBlock = this.element.querySelector('.film-selection_films');
    contentBlock?.insertAdjacentHTML(
      'beforeend',
      '<div>Отсутствует интернет</div>'
    );
  }
}
