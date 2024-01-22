import { Component } from '@components/component';
import * as templateFavoriteList from '@components/FavoriteList/favoriteList.hbs';
import { ROOT } from '@utils/config';
export class FavoriteList extends Component {
  /**
   * Метод рендеринга элемента
   * @param result
   */
  render (result) {
    this.element = this.createHTMLElement(
      templateFavoriteList(result),
      '.favorite'
    );
    return this.element;
  }
}
