import { Component } from '@components/component';
import * as templateActorInfo from '@components/ActorInfo/actorInfo.hbs';
import { responseStatus, ROOT } from '@utils/config';
import { store } from '@store/store';
import {
  actionAddFavoriteActor,
  actionRemoveFavoriteActor
} from '@store/action/actionTemplates';

/**
 * Класс рендеринга авторизации
 * @class ActorInfo
 * @typedef {ActorInfo}
 */
export class ActorInfo extends Component {
  /**
   * Метод рендеринга элемента
   * @param result
   * @returns {string} html авторизации
   */
  render (result) {
    this.element = this.createHTMLElement(
      templateActorInfo(result),
      '.film-page'
    );
    return this.element;
  }

  /**
   * Изменение флажка подписки
   * @param id
   */
  changeFavorite (id) {
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
      store.dispatch(actionAddFavoriteActor({ actor_id: id }));
    } else {
      store.dispatch(actionRemoveFavoriteActor({ actor_id: id }));
    }
  }
}
