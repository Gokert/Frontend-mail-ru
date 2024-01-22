import { Component } from '@components/component';
import * as templateContentBlock from '@components/ContentBlock/contentBlock.hbs';

/**
 * Класс рейдера формирования подборки фильмов
 * @class FilmSelection
 * @typedef {FilmSelection}
 */
export class ContentBlock extends Component {
  /**
   * Метод рендеринга элемента
   * @param isMain
   * @returns {string} html авторизации
   */
  render (isMain = false) {
    return templateContentBlock({ isMain: isMain });
  }
}
