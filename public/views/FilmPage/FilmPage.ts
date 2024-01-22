import { View } from '@views/view';
import { responseStatus, ROOT } from '@utils/config';
import { store } from '@store/store';
import {
  actionAddFavoriteFilm,
  actionAuth,
  actionFilm,
  actionGetCommentsFilm,
  actionRemoveComment,
  actionRemoveFavoriteFilm,
  actionSearchFilm
} from '@store/action/actionTemplates';
import { image } from '@components/Image/image';
import { Review } from '@components/Review/review';
import { ReviewForm } from '@components/ReviewForm/reviewForm';
import { Description } from '@components/Description/description';
import { Slider } from '@components/Slider/slider';
import { Component } from '@components/component';
import { searchData } from '@utils/searchData';
import { FilmSelection } from '@components/FilmSelection/filmSelection';
import { isPush } from '@utils/std';

export interface FilmPage {
  state: {
    filmInfo: null;
    components: Component[];
    fildId: number;
    mapFilms: {};
    rewiewBunch: number;
    commentsInfo: [];
  };
}

export class FilmPage extends View {
  private popupEvent;
  private descriptionComponent;

  /**
   * Конструктор для формирования родительского элемента
   * @param ROOT
   * @class
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      filmInfo: null,
      components: [],
      fildId: 0,
      commentsInfo: [],
      rewiewBunch: 1,
      mapFilms: {}
    };
  }
  /**
   * Метод создания страницы
   * @param props url
   */
  render (props) {
    store.subscribe(
      'filmCommentsStatus',
      this.subscribeCommentsStatus.bind(this)
    );

    this.renderDefaultPage();
    this.element = document.querySelector('main') as HTMLElement;

    if (props != null) {
      this.state.fildId = props.replace('/', '');
      store.dispatch(actionFilm({ filmId: this.state.fildId })).then(() => {
        this.state.filmInfo = store.getState('filmInfo');
        this.componentDidMount();

        store.dispatch(
          actionGetCommentsFilm({
            film_id: this.state.fildId,
            page: this.state.rewiewBunch,
            per_page: 20
          })
        );
      });
    }
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addDescription();
    this.addEqualFilms();
    this.addEvents();
  }

  /**
   * Метод добавления похожих фильмов на страницу
   */
  async addEqualFilms () {
    const genre = store.getState('filmInfo')?.genre;
    await store.dispatch(
      actionSearchFilm({
        title: '',
        dateFrom: '',
        dateTo: '',
        ratingFrom: 1,
        ratingTo: 10,
        mpaa: '',
        genre: genre ? genre.map((elem) => elem.genre_id) : [],
        actors: [''],
        page: 1,
        per_page: 10
      })
    );

    const slider = new Slider(ROOT);
    const films = store.getState('resultSearchFilm');
    const filmEqual = this.element.querySelector('.film-equal');
    const comments = this.element.querySelector('.film-page-comments');
    const image = this.element.querySelector('.image-container');

    image?.appendChild(<HTMLElement>filmEqual);
    image?.appendChild(<HTMLElement>comments);

    filmEqual?.appendChild(
      slider.render(searchData.addFilmsToHTML(films.body.films))
    );

    const filmSelect = new FilmSelection(ROOT);
    slider.setHeader(filmSelect.render('Похожие'));
  }

  /**
   * Метод добавления информации о фильме
   */
  addDescription () {
    this.element.querySelector('.content-block')?.remove();
    this.element.insertAdjacentHTML('afterbegin', image.render({}));

    const description = new Description(ROOT);
    this.descriptionComponent = description;
    const result = description.getData(this.state.filmInfo);

    const icon = this.element.querySelector('.image-container') as HTMLElement;
    const iconsShadow = this.element.querySelector(
      '.header__container__shadow'
    ) as HTMLElement;

    icon!.style.backgroundImage = 'url("' + result.poster + '")';
    icon!.style.backgroundAttachment = 'fixed';
    iconsShadow!.style.backgroundAttachment = 'fixed';

    const containerHTML = this.element.querySelector('.image-container');
    containerHTML?.appendChild(description.render(this.state.filmInfo));

    const genre = this.element.querySelector('.param-list__right__row-genre');
    const collectionGenreItems = result.genre;
    for (let i = 0; i < collectionGenreItems.length; i++) {
      const item = collectionGenreItems[i];
      genre?.insertAdjacentHTML(
        'beforeend',
        `<div class="film-page__genre" >${item.title}</div>`
      );
    }
  }

  /**
   * Метод добавления комментов
   */
  addComments () {
    const mainHTML = this.element.querySelector(
      '.film-page__comments'
    ) as HTMLElement;
    const reviewForm = new ReviewForm(ROOT);
    const auth = store.getState('auth');

    if (auth.status === responseStatus.success) {
      mainHTML?.appendChild(
        reviewForm.render({ login: true, filmId: this.state.fildId })
      );
    }

    const result = this.state.commentsInfo['comment'];

    result.forEach((res) => {
      const table = {
        user: true,
        photo: res['photo'],
        name: res['name'],
        rating: res['rating'],
        text: res['text'],
        userId: res['id_user']
      };

      const review = new Review(ROOT);
      mainHTML?.appendChild(review.render(table));
    });

    if (
      store.getState('auth')?.role === undefined &&
      store.getState('auth')?.status === responseStatus.success
    ) {
      store.subscribe('auth', this.subscribeDeleteComment.bind(this));
      store.dispatch(actionAuth());
    }
  }

  /**
   * Метод добавления обработчика событий
   */
  addEvents () {
    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.image-watchlist.main-film-card'):
          this.descriptionComponent.changeFlagWatchList(this.state.fildId);
          break;
        case isPush(event, '.table__actor__text'):
          this.componentWillUnmount();
          const actorId = event.target
            .closest('.table__actor__text')
            .getAttribute('data-section');
          this.renderNewPage('/actor', `/${actorId}`);
          break;
        case isPush(event, '.review-button'):
          this.redirectToComments();
          break;
        case isPush(event, '.image-cancel'):
          if (store.getState('auth').status === responseStatus.success) {
            this.removeComment(
              Number(
                event.target.closest('.comment')?.getAttribute('data-section')
              ),
              event.target.closest('.comment')
            );
          }
          break;
        default:
          break;
      }
    };

    const popup = this.element.querySelector('.main-container');
    popup?.addEventListener('click', this.popupEvent);
  }

  /**
   * Редирект на коммент
   */
  redirectToComments () {
    const status = store.getState('auth').status;
    if (status !== responseStatus.success) {
      this.renderNewPage('/login');
    } else {
      const element = this.element.querySelector(
        '.film-page__comments__header'
      );
      element?.scrollIntoView();
    }
  }

  /**
   * Метод удаления коммента
   * @param id айди коммента
   * @param HTMLElement html коммента
   */
  removeComment (id, HTMLElement) {
    store.dispatch(
      actionRemoveComment({
        film_id: this.state.fildId,
        user_id: id,
        deleteFromServiceFilms: true
      })
    );
    store.dispatch(
      actionRemoveComment({
        film_id: this.state.fildId,
        user_id: id,
        deleteFromServiceFilms: false
      })
    );
    HTMLElement?.remove();
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    store.unsubscribe(
      'filmCommentsStatus',
      this.subscribeCommentsStatus.bind(this)
    );

    this.state.components.forEach((elem) => {
      elem?.componentWillUnmount();
    });

    const popup = document.querySelector('.film-selection');
    popup?.removeEventListener('click', this.popupEvent);
  }

  /**
   * Подписка на получение статуса отправки коммента
   */
  subscribeCommentsStatus () {
    const result = store.getState('filmCommentsStatus');
    if (result?.status === responseStatus.success) {
      store.unsubscribe(
        'filmCommentsStatus',
        this.subscribeCommentsStatus.bind(this)
      );
      this.state.commentsInfo = result.body;
      this.addComments();
    }
  }

  /**
   * Подписка на получение статуса удаления коммента
   */
  subscribeDeleteComment () {
    store.unsubscribe('auth', this.subscribeDeleteComment.bind(this));
    const auth = store.getState('auth');

    if (
      auth?.status === responseStatus.success &&
      (auth?.body.role === 'super' || auth?.body.role === 'moderator')
    ) {
      const removes = document.querySelectorAll(
        '.comment-header__left__comment-remove'
      );
      removes?.forEach((elem) => {
        elem.classList.remove('noactive');
      });
    }
  }
}
