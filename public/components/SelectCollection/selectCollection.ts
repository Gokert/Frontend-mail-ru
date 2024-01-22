import { collections } from '@utils/config';
import { Component } from '@components/component';
import * as templateSelectCollection from '@components/SelectCollection/selectCollection.hbs';
import { addActive, isPush, removeActive } from '@utils/std';
import { inputButton } from '@components/inputButton/inputButton';

/**
 * Класс формирования окна выбора подборки фильмов
 * @class SelectCollection
 * @typedef {SelectCollection}
 */
export class SelectCollection extends Component {
  private panelEvent;
  private firstSearchActor;
  private popupEvent;
  private renderedSearchFilm;
  private firstSearchFilm;
  private HTMLElements;

  /**
   * Метод рендеринга элемента
   * @return {string} html авторизации
   */
  render () {
    this.element = this.createHTMLElement(
      templateSelectCollection(collections),
      '.search-container'
    );
    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      const divElement = this.element.querySelectorAll('.title-type');
      divElement.forEach((elem) => {
        // @ts-ignore
        elem?.style.isHovered = 'none';
      });
    }

    this.firstSearchFilm = true;
    this.firstSearchActor = true;
    this.renderedSearchFilm = true;
    this.addElements();
    this.addEvents(this.HTMLElements);

    this.panelEvent = (event) => {
      switch (true) {
        case isPush(event, '.search-container__select__films'):
          this.renderedSearchFilm = true;
          this.selectFilmButton();
          break;
        case isPush(event, '.search-container__select__actors'):
          this.renderedSearchFilm = false;
          this.selectActorButton();
          break;
        default:
          break;
      }
    };

    this.element?.addEventListener('click', this.panelEvent);
  }

  /**
   * Метод выбора кнопки фильма
   */
  selectFilmButton () {
    const searchActor = this.element.querySelector('.search-inputs-actor');
    const searchFilm = this.element.querySelector('.search-inputs-film');
    const actorButtom1 = this.element.querySelector(
      '.film-selection__header__yellow-selection-actor'
    );
    const filmButtom1 = this.element.querySelector(
      '.film-selection__header__yellow-selection-film'
    );
    filmButtom1?.classList.remove('noactive-opacity');
    actorButtom1?.classList.add('noactive-opacity');
    actorButtom1?.classList.remove('active-opacity');

    searchActor?.classList.add('noactive');
    searchFilm?.classList.remove('noactive');
  }

  /**
   * Метод выбора кнопки актера
   */
  selectActorButton () {
    const searchActor = this.element.querySelector('.search-inputs-actor');
    const searchFilm = this.element.querySelector('.search-inputs-film');
    const actorButtom = this.element.querySelector(
      '.film-selection__header__yellow-selection-actor'
    );
    const filmButtom = this.element.querySelector(
      '.film-selection__header__yellow-selection-film'
    );
    actorButtom?.classList.add('active-opacity');
    actorButtom?.classList.remove('noactive-opacity');
    filmButtom?.classList.remove('active-opacity');
    filmButtom?.classList.add('noactive-opacity');

    searchActor?.classList.remove('noactive');
    searchFilm?.classList.add('noactive');
  }

  /**
   * Метод добавление элементов
   */
  addElements () {
    let titleFilm, rating, years, mpaa, sectionActors, genre;

    const searchActor = this.element.querySelector('.search-inputs-actor');
    const searchFilm = this.element.querySelector('.search-inputs-film');

    if (searchFilm?.closest('.noactive')) {
      searchActor?.classList.add('noactive');
      searchFilm?.classList.remove('noactive');
    }

    this.renderedSearchFilm = true;
    if (this.firstSearchFilm) {
      this.firstSearchFilm = false;
      titleFilm = this.element.querySelector('.section-title') as HTMLElement;
      titleFilm?.insertAdjacentHTML(
        'beforeend',
        inputButton.render({ wrap: 'select', module: 'select' })
      );

      genre = this.element.querySelector('.section-title-type');
      const collectionGenreItems = collections.collection_items;
      for (let i = 0; i < collectionGenreItems.length; i++) {
        const item = collectionGenreItems[i];
        genre?.insertAdjacentHTML(
          'beforeend',
          `<div class="title-type" data-section="${item.value}">${item.key}</div>`
        );
      }

      rating = this.element.querySelector('.section-rating');
      const ratingLeft = this.element.querySelector('.section-rating__left');
      const ratingRight = this.element.querySelector('.section-rating__right');
      ratingLeft?.insertAdjacentHTML(
        'beforeend',
        inputButton.render({
          wrap: 'rating-left',
          module: 'select',
          type: 'number'
        })
      );
      ratingRight?.insertAdjacentHTML(
        'beforeend',
        inputButton.render({
          wrap: 'rating-right',
          module: 'select',
          type: 'number'
        })
      );

      years = this.element.querySelector('.section-years');
      const yearsLeft = this.element.querySelector('.years-select__left');
      const yearsRight = this.element.querySelector('.years-select__right');
      yearsLeft?.insertAdjacentHTML(
        'beforeend',
        inputButton.render({
          wrap: 'years-left',
          module: 'select',
          type: 'date'
        })
      );
      yearsRight?.insertAdjacentHTML(
        'beforeend',
        inputButton.render({
          wrap: 'years-right',
          module: 'select',
          type: 'date'
        })
      );

      sectionActors = this.element.querySelector('.section-actors');
      sectionActors?.insertAdjacentHTML(
        'beforeend',
        inputButton.render({ wrap: 'actors', module: 'select' })
      );

      mpaa = this.element.querySelector('.mpaa-container');
    }

    this.HTMLElements = {
      '.title-select': titleFilm,
      '.genre-select': genre,
      '.rating-select': rating,
      '.mpaa-select': mpaa,
      '.years-select': years,
      '.actors-select': sectionActors
    };
  }

  /**
   * Метод добавления нажатия на жанр
   * @param elements
   */
  addEvents (elements) {
    this.popupEvent = (event) => {
      const selector = Object.keys(elements).find((key) =>
        event.target.closest(key)
      );

      if (selector) {
        this.toggleActive(elements[selector]);
      }

      switch (true) {
        case isPush(event, '.title-type'):
          if (!isPush(event, '.title-type.active')) {
            event.target.classList.add('active');
          } else {
            event.target.classList.remove('active');
          }
          break;
        default:
          break;
      }
    };
    const popup = this.element.querySelector('.search-inputs-film');
    popup?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод активации кнопки
   * @param element
   */
  toggleActive (element) {
    if (!element.closest('.active')) {
      addActive(element);
    } else {
      removeActive(element);
    }
  }

  /**
   * Получение query параметра из данных фильма
   */
  getFilmsQuery () {
    const title = (
      this.element.querySelector('.select-input-select') as HTMLInputElement
    )?.value?.trim();
    const ratingFrom = (
      this.element.querySelector(
        '.rating-left-input-select'
      ) as HTMLInputElement
    )?.value;
    const ratingTo = (
      this.element.querySelector(
        '.rating-right-input-select'
      ) as HTMLInputElement
    )?.value;
    const mpaa = (
      this.element.querySelector('.mpaa-container__input') as HTMLInputElement
    )?.checked;
    const dateFrom = (
      this.element.querySelector('.years-left-input-select') as HTMLInputElement
    )?.value;
    const dateTo = (
      this.element.querySelector(
        '.years-right-input-select'
      ) as HTMLInputElement
    )?.value;
    const actors = (
      this.element.querySelector('.actors-input-select') as HTMLInputElement
    )?.value.split(',');
    let mpaaResult;
    if (mpaa) {
      mpaaResult = 'R';
    } else {
      mpaaResult = '';
    }

    const genres = this.element.querySelectorAll('.title-type.active');
    const sectionDataArray = Array.from(genres).map((div) =>
      parseInt(<string>div.getAttribute('data-section'))
    );

    return `?title=${title}&date_from=${dateFrom}&date_to=${dateTo}&rating_from=${ratingFrom}&rating_to=${ratingTo}&mpaa=${mpaaResult}&genre=${sectionDataArray}&actors=${actors}`;
  }

  /**
   * Получение query параметра из данных актёра
   */
  getActorsQuery () {
    const name = (
      this.element.querySelector('.name-input-select') as HTMLInputElement
    )?.value?.trim();

    const amplua = (
      this.element.querySelector('.actors-input-select') as HTMLInputElement
    )?.value.split(' ');

    const country = (
      this.element.querySelector('.country-input-select') as HTMLInputElement
    )?.value;
    const birthday = (
      this.element.querySelector('.birthday-input-select') as HTMLInputElement
    )?.value;
    const films = (
      this.element.querySelector(
        '.films-selection-input-select'
      ) as HTMLInputElement
    )?.value.split(' ');
    return `?name=${name}&amplua=${amplua}&country=${country}&birthday=${birthday}&films=${films}`;
  }

  /**
   * Метод очитски
   */
  componentWillUnmount () {}
}
