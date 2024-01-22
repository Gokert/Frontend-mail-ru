import { Component } from '@components/component';
import * as templateActorCard from '@components/ActorCard/actorCard.hbs';
import { isPush } from '@utils/std';
import { store } from '@store/store';
import { actionRemoveFavoriteActor } from '@store/action/actionTemplates';

/**
 * Класс рендеринга карточки актера
 * @class ActorCard
 * @typedef {ActorCard}
 */
export class ActorCard extends Component {
  private popupEvent;
  private actorId;

  /**
   * Метод рендеринга элемента
   * @return {string}
   * @param actor.actor
   * @param actor.alreadyFavorite
   * @param actor.addClass
   * @param actor.addClassPoster
   * @param actor.renderDelete
   * @param actor.adminPanel
   * @param actor
   */
  render ({
    actor,
    alreadyFavorite,
    renderDelete,
    addClass = '',
    addClassPoster = '',
    adminPanel = false
  }) {
    const result = {
      id: actor.actor_id,
      title: actor.actor_name,
      poster: actor.actor_photo,
      alreadyFavorite: alreadyFavorite,
      renderDelete: renderDelete,
      adminPanel: adminPanel,
      addClass: addClass,
      addClassPoster: addClassPoster
    };
    this.element = this.createHTMLElement(
      templateActorCard(result),
      '.actor-selection_actor'
    );
    this.actorId = actor.actor_id;
    this.componentDidMount(adminPanel);
    return this.element;
  }

  /**
   * Метод инициализации страницы
   * @param adminPanel
   */
  componentDidMount (adminPanel) {
    this.addEvent(adminPanel);
  }

  /**
   * Метод добавления обработчика событий
   * @param adminPanel
   */
  addEvent (adminPanel) {
    this.popupEvent = (event) => {
      switch (true) {
        case isPush(event, '.image-cancel'):
          store.dispatch(actionRemoveFavoriteActor({ actor_id: this.actorId }));
          this.componentWillUnmount();
          this.element?.remove();
          break;
        case isPush(event, '.actor-selection_actor'):
          if (adminPanel) {
            return;
          }

          this.componentWillUnmount();
          this.renderNewPage('/actor', `/${this.actorId}`);
          break;
        default:
          break;
      }
    };

    this.element?.addEventListener('click', this.popupEvent);
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    this.element?.removeEventListener('click', this.popupEvent);
  }
}
