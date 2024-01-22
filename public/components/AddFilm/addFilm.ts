import { Component } from '@components/component';
import * as templateAddFilm from '@components/AddFilm/addFilm.hbs';
import { collections, errorInputs, responseStatus, ROOT } from '@utils/config';
import { inputButton } from '@components/inputButton/inputButton';
import { buttonSubmit } from '@components/ButtonSubmit/buttonSubmit';
import { store } from '@store/store';
import {
  actionAddFilm,
  actionSearchActor
} from '@store/action/actionTemplates';
import {
  addErrorsActive,
  defaultVariable,
  insertText,
  removeErrors,
  removeErrorsActive
} from '@utils/addError';
import { addActive, isPush, removeActive } from '@utils/std';
import { searchData } from '@utils/searchData';

/**
 * Класс рендеринга создания фильма
 * @class AddFilm
 * @typedef {AddFilm}
 */
export class AddFilm extends Component {
  private popupEvent;
  private changeEvent;
  private pageNumber;
  private perPage;
  private errorsHTML;
  private wraps;
  private inputsHTML;
  private file;
  private defaultImage;

  /**
   * Метод рендеринга элемента
   * @param result
   * @return {string} html авторизации
   */
  render () {
    this.element = this.createHTMLElement(templateAddFilm(), '.add-film');
    this.componentDidMount();
    return this.element;
  }

  /**
   * Добавление элементов на страницу
   */
  addElements () {
    const settings = this.element.querySelector(
      '.change-user-data'
    ) as HTMLElement;
    const title = this.element.querySelector('.title-text');
    const date = this.element.querySelector('.date-text');
    const country = this.element.querySelector('.country-text');
    const button = this.element.querySelector('.add-film__left');
    const genre = this.element.querySelector('.section-title-type');

    settings!.style.width = '100%';

    const collectionGenreItems = collections.collection_items;
    collectionGenreItems.forEach((item) => {
      genre?.insertAdjacentHTML(
        'beforeend',
        `<div class="title-type-admin" data-section="${item.value}">${item.key}</div>`
      );
    });

    title!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'title', module: 'add-film' })
    );

    country!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'country', module: 'add-film' })
    );

    date!.insertAdjacentHTML(
      'beforeend',
      inputButton.render({
        wrap: 'date',
        module: 'add-film',
        type: 'number'
      })
    );

    button?.insertAdjacentHTML(
      'beforeend',
      buttonSubmit.render({ text: 'Сохранить' })
    );

    const name = this.element.querySelector('.actors-text-add') as HTMLElement;
    name?.insertAdjacentHTML(
      'beforeend',
      inputButton.render({ wrap: 'name', module: 'select' })
    );
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addElements();
    this.init();
    this.addChangeEvent();
    this.addPopupEvent();
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    const installPoster = this.element.querySelector('.add-film__left__poster');
    installPoster?.removeEventListener('change', this.changeEvent);
    this.element?.addEventListener('click', this.popupEvent);
  }

  addChangeEvent () {
    this.changeEvent = (event) => {
      switch (true) {
        case isPush(event, '.settings_file'):
          this.loadPhoto();
          break;
        default:
          break;
      }
    };

    const installPoster = this.element.querySelector('.add-film__left__poster');
    installPoster?.addEventListener('change', this.changeEvent);
  }

  /**
   * Загрузка картинки на страницу
   */
  loadPhoto () {
    const file = this.element.querySelector(
      '.settings_file'
    ) as HTMLInputElement;
    const image = this.element.querySelector(
      '.settings__img'
    ) as HTMLImageElement;

    this.defaultImage = image.src;
    // @ts-ignore
    if (file?.files?.length > 0) {
      // @ts-ignore
      if (!file.files[0]?.type?.startsWith('image/')) {
        this.insertErrors(
          'Ошибка: Загруженный файл не является изображением!',
          <HTMLElement | null> this.element.querySelector('.error-image')
        );
        return;
      } else {
        this.removeError({ image: this.errorsHTML['image'] });
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.target && e.target.result) {
          image.src = `${e.target.result}`;
        }
      };

      if (file.files && file.files[0]) {
        this.file = file.files[0];
        reader.readAsDataURL(file.files[0]);
      }
    }
  }

  /**
   * Метод добавления ошибок
   * @param errorText
   * @param HTMLElement
   */
  insertErrors (errorText, HTMLElement) {
    if (HTMLElement) {
      insertText(HTMLElement, errorText);
    } else {
      insertText(this.errorsHTML, errorText);
    }
  }

  /**
   * Метод удаления ошибок
   * @param data
   */
  removeError (data) {
    removeErrors(data);
  }

  /**
   * Добавление обработчика событий
   */
  addPopupEvent () {
    const actorFind = this.element.querySelector('.actors-find') as HTMLElement;
    actorFind!.style.marginTop = '20px';

    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.center-text'):
          const last = this.element.querySelector('.center-text.active');
          last?.classList.remove('active');
          event.target.classList.add('active');
          break;
        case isPush(event, '.actor-selection_actor'):
          const selected = this.element.querySelector('.selected-actors');
          const allActors = this.element.querySelector('.results-actors');
          if (isPush(event, '.actor-selection_actor.active')) {
            event.target
              .closest('.actor-selection_actor')
              ?.classList.remove('active');
            selected?.appendChild(
              event.target.closest('.actor-selection_actor')
            );
            const name = event.target
              .closest('.actor-selection_actor')
              ?.querySelector('.actor-selection_actor_name');
            name.style.color = 'black';
          } else {
            event.target
              .closest('.actor-selection_actor')
              ?.classList.add('active');
            allActors?.appendChild(
              event.target.closest('.actor-selection_actor')
            );
            const name = event.target
              .closest('.actor-selection_actor')
              ?.querySelector('.actor-selection_actor_name');
            name.style.color = 'white';
          }
          break;
        case isPush(event, '.actors-find'):
          event.preventDefault();
          this.pageNumber = 1;
          this.getFormActors();
          break;
        case isPush(event, '.more-elements'):
          this.getFormActors();
          break;
        case isPush(event, '.button-submit'):
          event.preventDefault();
          removeErrors(this.errorsHTML);
          removeErrorsActive(this.wraps);
          this.dispatchDataFilm();
          break;
        case isPush(event, '.title-type-admin'):
          if (!isPush(event, '.title-type-admin.active')) {
            event.target.classList.add('active');
          } else {
            event.target.classList.remove('active');
          }
          break;
        default:
          break;
      }
    };

    this.element?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод валидации данных
   * @param dir
   */
  validateForm (dir) {
    let result = true;
    const elements = this.errorsHTML;
    const wraps = this.wraps;

    if (dir.title === '') {
      insertText(elements['title'], errorInputs.NotAllElement);
      addErrorsActive(wraps['title']);
      result = false;
    }

    if (dir.info === '') {
      insertText(elements['textArea'], errorInputs.NotAllElement);
      addErrorsActive(wraps['textArea']);
      result = false;
    }

    if (dir.country === '') {
      insertText(elements['country'], errorInputs.NotAllElement);
      addErrorsActive(wraps['country']);
      result = false;
    }

    if (dir.date === '') {
      insertText(elements['date'], errorInputs.NotAllElement);
      addErrorsActive(wraps['date']);
      result = false;
    } else if (Number(dir.date) < 1895 || Number(dir.date) > 2028) {
      insertText(elements['date'], errorInputs.VariableError);
      addErrorsActive(wraps['date']);
      result = false;
    }

    if (dir.file && dir.file?.type?.startsWith('image/')) {
    } else {
      insertText(
        document.querySelector('.error-image'),
        'Ошибка: Загруженный файл не является изображение или файл отсутствует'
      );
      result = false;
    }

    if (dir.genre.length === 0) {
      insertText(elements['genre'], errorInputs.NotAllElement);
      result = false;
    }

    if (dir.actors.length === 0) {
      insertText(elements['actors'], errorInputs.NotAllElement);
      result = false;
    }

    return result;
  }

  /**
   * Метод отправки данных не сервер
   */
  dispatchDataFilm () {
    const genres = this.element.querySelectorAll('.title-type-admin.active');
    const actors = this.element
      .querySelector('.selected-actors')
      ?.querySelectorAll('.actor-selection_actor');

    const formData = this.getFormData();
    const data = this.getData();

    if (
      this.validateForm({
        title: data.title,
        info: data.info,
        date: data.date,
        country: data.country,
        file: data.file,
        actors: actors,
        genre: genres
      })
    ) {
      store.dispatch(actionAddFilm({ file: formData })).then(() => {
        if (store.getState('addFilm').status === responseStatus.success) {
          setTimeout(() => {
            ROOT?.insertAdjacentHTML(
              'beforeend',
              '<img class="create-successfully" src="/icons/icon-success.webp" alt=""/>'
            );
          });
          setTimeout(() => {
            this.element.querySelector('.create-successfully')?.remove();
          }, 4000);
          const selectedActors = this.element.querySelector('.selected-actors');
          const allActors = this.element.querySelector('.results-actors');
          selectedActors!.innerHTML = '';
          allActors!.innerHTML = '';

          genres.forEach((genre) => {
            genre.classList.remove('active');
          });
          defaultVariable(this.inputsHTML);

          const image = this.element.querySelector(
            '.settings__img'
          ) as HTMLImageElement;
          image.src = '/icons/space6.webp';
        }
      });
    }
  }

  /**
   * Метод получения FormData из данных инпутов
   */
  getFormData () {
    const elements = this.inputsHTML;
    const genres = Array.from(
      this.element.querySelectorAll('.title-type-admin.active')
    );
    const actors = Array.from(
      this.element
        .querySelector('.selected-actors')
        ?.querySelectorAll('.actor-selection_actor') || []
    );
    const sectionDataArray = genres.map((div: HTMLElement) =>
      parseInt(div.getAttribute('data-section') || '0')
    );
    const sectionActorsArray = actors.map((div: HTMLElement) =>
      parseInt(div.getAttribute('data-section') || '0')
    );

    const data = new FormData();
    const info = this.getData();

    let file;
    if (elements['file']?.files[0]) {
      file = elements['file']?.files[0];
    } else if (this.file !== '') {
      file = this.file;
    }

    data.append('title', info.title);
    data.append('info', info.info);
    data.append('date', info.date);
    data.append('country', info.country);
    data.append('genre', sectionDataArray.join(','));
    data.append('actors', sectionActorsArray.join(','));
    if (file) {
      data.append('photo', file);
    }

    return data;
  }

  /**
   * Метод получения данных из инпутов
   */
  getData () {
    const elements = this.inputsHTML;
    const title = elements['title']?.value.trim();
    const info = elements['textArea'].value;
    const country = elements['country'].value.trim();
    const date = elements['date'].value;
    let file;

    if (elements['file']?.files[0]) {
      file = elements['file']?.files[0];
    } else if (this.file !== '') {
      file = this.file;
    }

    return {
      title: title,
      info: info,
      country: country,
      date: date,
      file: file
    };
  }

  getFormActors () {
    const nameActor = (
      this.element.querySelector('.name-input-select') as HTMLInputElement
    ).value.trim();

    if (this.pageNumber === 1) {
      const allActors = this.element.querySelector(
        '.results-actors'
      ) as HTMLElement;
      allActors!.innerHTML = '';
    }

    store.subscribe('resultSearchActor', this.resultFindActors.bind(this));
    store.dispatch(
      actionSearchActor({
        name: nameActor,
        amplua: [''],
        county: '',
        birthday: '',
        films: [''],
        page: this.pageNumber++,
        per_page: this.perPage
      })
    );
  }

  resultFindActors () {
    const response = store.getState('resultSearchActor');
    store.unsubscribe('resultSearchActor', this.resultFindActors.bind(this));
    const more = this.element.querySelector('.more-elements');
    const body = this.element.querySelector('.results-actors');

    if (response?.status === responseStatus.success) {
      response?.body.actors.forEach((value) => {
        body?.appendChild(
          <HTMLElement>searchData.addActorsToHTML([value], false, true)[0]
        );
      });
    }

    if (response?.body.actors.length >= this.perPage) {
      addActive(more);
    } else {
      removeActive(more);
    }
  }

  /**
   * Метод инициализации ссылок на элементы
   */
  init () {
    const inputHtml = this.element.querySelector('.error-login');
    const textAreaHtml = this.element.querySelector('.error-text-area');
    const countryHtml = this.element.querySelector('.error-country');
    const dateHtml = this.element.querySelector('.error-birthday');
    const genreHtml = this.element.querySelector('.error-genre');
    const actorsHtml = this.element.querySelector('.error-actors');
    const imageError = this.element.querySelector('.error-image');

    const wrapLogin = this.element.querySelector('.title');
    const wrapInfo = this.element.querySelector('.text-area');
    const wrapCountry = this.element.querySelector('.country');
    const wrapDate = this.element.querySelector('.date');

    const titleHTML = this.element.querySelector(
      '.title-input-add-film'
    ) as HTMLInputElement;
    const infoHTML = this.element.querySelector(
      '.review-form__body__text'
    ) as HTMLInputElement;
    const dateHTML = this.element.querySelector(
      '.date-input-add-film'
    ) as HTMLInputElement;
    const fileInputHTML = this.element.querySelector(
      '.settings_file'
    ) as HTMLInputElement;
    const countryHTML = this.element.querySelector(
      '.country-input-add-film'
    ) as HTMLInputElement;

    const genres = this.element.querySelectorAll('.title-type-admin.active');
    const actors = this.element
      .querySelector('.selected-actors')
      ?.querySelectorAll('.actor-selection_actor');

    this.errorsHTML = {
      title: inputHtml,
      textArea: textAreaHtml,
      country: countryHtml,
      genre: genreHtml,
      date: dateHtml,
      actors: actorsHtml,
      image: imageError
    };

    this.wraps = {
      title: wrapLogin,
      textArea: wrapInfo,
      country: wrapCountry,
      date: wrapDate
    };

    this.inputsHTML = {
      title: titleHTML,
      textArea: infoHTML,
      country: countryHTML,
      date: dateHTML,
      genre: genres,
      actors: actors,
      image: fileInputHTML
    };
  }
}

export const addFilm = new AddFilm(ROOT);
