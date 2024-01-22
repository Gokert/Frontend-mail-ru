import { Component } from '@components/component';

import * as templateReview from '@components/Review/review.hbs';
/**
 * Класс создания нижней панели
 * @class Review
 * @typedef {Review}
 */
export class Review extends Component {
  /**
   * Метод для рендеринга HTML кодаf
   * @param reviews
   * @param table
   * @return {string} html нижней панели
   */
  render (table) {
    this.element = this.createHTMLElement(templateReview(table), '.comment');
    this.componentDidMount(table);
    return this.element;
  }

  /**
   * Метод инициализации страницы
   * @param table
   */
  componentDidMount (table) {
    this.setColor(table);
  }

  /**
   * Метод установления цвета коммента
   * @param table
   */
  setColor (table) {
    switch (true) {
      case table.rating < 4:
        this.element.style.background = 'rgba(255, 229, 229, 0.9)';
        break;
      case table.rating > 6:
        this.element.style.background = 'rgba(189, 230, 189, 0.9)';
        break;
      default:
        this.element.style.background = 'rgba(255, 240, 195, 0.9)';
        break;
    }
  }
}
