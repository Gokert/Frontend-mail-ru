import { Component } from '@components/component';
import * as templateReviewForm from '@components/ReviewForm/reviewForm.hbs';
import { store } from '@store/store';
import {
  actionAddComment,
  actionAddCommentTwo
} from '@store/action/actionTemplates';
import { validateReview } from '@utils/validate';
import { addErrorsActive, insertText } from '@utils/addError';
import { router } from '@router/router';
import { responseStatus, ROOT } from '@utils/config';

export interface ReviewForm {
  state: {
    fildId: number;
  };
}

/**
 * Класс рендеринга формы заполенения отзыва
 * @class ReviewForm
 * @typedef {ReviewForm}
 */
export class ReviewForm extends Component {
  private eventFunc;

  constructor (ROOT) {
    super(ROOT);
    this.state = {
      fildId: 0
    };
  }
  /**
   * Метод рендеринга элемента
   * @param params
   * @returns {string} html форма заполенения отзыва
   */
  render (params) {
    this.element = this.createHTMLElement(
      templateReviewForm(params),
      '.review-form'
    );
    this.componentDidMount(params.filmId);
    return this.element;
  }

  /**
   * Метод инициализации страницы
   * @param filmId
   */
  componentDidMount (filmId) {
    this.addEvent(filmId);
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    const review = this.element.querySelector('.review-form__body__button');
    review?.removeEventListener('click', this.eventFunc);
  }

  /**
   * Добавление обработчика событий
   * @param fildId
   */
  addEvent (fildId) {
    this.state.fildId = fildId;
    const selectHTML: HTMLInputElement | null =
      this.element.querySelector('.rating__form');
    const review = this.element.querySelector('.review-form__body__button');
    const textHTML: HTMLInputElement | null = this.element.querySelector(
      '.review-form__body__text'
    );

    if (textHTML) {
      textHTML.style.height = '200px';
    }

    if (store.getState('auth').status === responseStatus.success) {
      this.eventFunc = (event) => {
        event.preventDefault();

        const select = parseInt(selectHTML!.value);
        const text = textHTML!.value;

        const result = validateReview(text);
        if (!result.result) {
          this.addError(result.error);
          return;
        }

        store.subscribe('addComment', this.subscribeAddComment.bind(this));
        store.dispatch(
          actionAddComment({
            film_id: this.state.fildId,
            rating: select,
            text: text
          })
        );

        store.dispatch(
          actionAddCommentTwo({
            film_id: this.state.fildId,
            rating: select,
            text: text
          })
        );
      };

      review?.addEventListener('click', this.eventFunc);
    }
  }

  /**
   * Подписка на результат добавления коммента
   */
  subscribeAddComment () {
    store.unsubscribe('addComment', this.subscribeAddComment.bind(this));

    if (store.getState('addCommentStatus') === responseStatus.success) {
      router.refresh();
    } else {
      this.element.querySelector('.input__form')!.innerHTML =
        '<h4>Вы уже писали отзыв</h4>';
    }
  }

  /**
   * Добавление ошибки
   * @param error
   */
  addError (error) {
    const errorHTML = this.element.querySelector('.review-form__body__error');
    addErrorsActive(this.element.querySelector('.text-area'));
    insertText(errorHTML, error);
  }
}
