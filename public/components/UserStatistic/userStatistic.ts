import { Component } from '@components/component';
import * as templateUserStatistic from '@components/UserStatistic/userStatistic.hbs';
import { store } from '@store/store';
import { collections } from '@utils/config';

/**
 * Класс рендеринга статистики юзера
 * @class UserStatistic
 * @typedef {UserStatistic}
 */
export class UserStatistic extends Component {
  /**
   * Метод рендеринга элемента
   * @param result
   * @param data
   * @returns {string} html элемента блока изменения данных
   */
  render (data) {
    this.element = this.createHTMLElement(
      templateUserStatistic({ result: this.getResult(data) }),
      '.user-statistic'
    );
    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {}

  /**
   * Метод получение данных для инициализации страницы
   * @param statistic данные из ответа
   */
  getResult (statistic) {
    return collections.collection_items.map((elem) => {
      const matchedObject = statistic.find(
        (object) => elem.value === object.genre_id
      );
      if (matchedObject) {
        return {
          genreName: elem.key,
          genreId: matchedObject.genre_id,
          count: matchedObject.count,
          avg: matchedObject.avg.toFixed(1),
          color: elem.color
        };
      } else {
        return {
          genreName: elem.key,
          genreId: elem.value,
          count: 0,
          avg: 0,
          color: elem.color
        };
      }
    });
  }

  /**
   * Метод очистки
   */
  ComponentWillUnmount () {}
}
