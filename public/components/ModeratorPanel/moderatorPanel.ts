import { Component } from '@components/component';
import * as templateModeratorPanel from '@components/ModeratorPanel/moderatorPanel.hbs';
import { store } from '@store/store';
import { addActive, isPush, removeActive } from '@utils/std';
import {
  actionModerSearchUsers,
  actionUpdateRole
} from '@store/action/actionTemplates';

/**
 * Класс создания modal
 * @class ModeratorPanel
 * @typedef {ModeratorPanel}
 */
export class ModeratorPanel extends Component {
  private perPage;
  private pageNumber;
  private moderEvent;

  /**
   * Метод для рендеринга HTML кода
   * @return {string} html нижней панели
   */
  render () {
    this.element = this.createHTMLElement(
      templateModeratorPanel(),
      '.moderator'
    );
    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addModerEvent();
  }

  /**
   * Метод добавления обработчика событий
   */
  addModerEvent () {
    const selected = this.element.querySelector(
      '.moderator-role__form'
    ) as HTMLSelectElement;
    const search = this.element.querySelector(
      '.moderator-search'
    ) as HTMLInputElement;
    store.subscribe(
      'searchModerUser',
      this.subscribeResultSearchUsers.bind(this)
    );

    this.moderEvent = (event) => {
      event.preventDefault();
      switch (true) {
        case isPush(event, '.select-user-role'):
          if (isPush(event, 'option')) {
            store.dispatch(
              actionUpdateRole({
                login: event.target
                  .closest('.moderator__body__user')
                  .getAttribute('data-section'),
                role: event.target.value
              })
            );
          }
          break;
        case isPush(event, '.moderator-submit'):
          this.pageNumber = 1;
          store.dispatch(
            actionModerSearchUsers({
              login: search?.value,
              role: selected?.value,
              page: this.pageNumber,
              per_page: this.perPage
            })
          );
          break;
        case isPush(event, '.more-elements'):
          store.dispatch(
            actionModerSearchUsers({
              login: search?.value,
              role: selected?.value,
              page: ++this.pageNumber,
              per_page: this.perPage
            })
          );
          break;
        default:
          break;
      }
    };

    this.element?.addEventListener('click', this.moderEvent);
  }

  /**
   * Подписка на результат поиска юзеров
   */
  subscribeResultSearchUsers () {
    const roles = {
      moderator: `<option value='moderator'>модератор</option>`,
      user: `<option value='user'>юзер</option>`
    };

    store.unsubscribe(
      'searchModerUser',
      this.subscribeResultSearchUsers.bind(this)
    );
    const body = this.element.querySelector('.moderator__body');
    if (this.pageNumber === 1) {
      body!.innerHTML = '';
    }
    const result = store.getState('searchModerUser')?.body;
    const more = this.element.querySelector('.more-elements');

    result.forEach((elem) => {
      let res = roles[elem.role];

      if (elem.role === 'super') {
        res = `<option value='super' disabled selected>админ</option>`;
      } else {
        for (const role in roles) {
          if (roles[role] !== roles[elem.role]) {
            res += roles[role];
          }
        }
      }

      body?.insertAdjacentHTML(
        'beforeend',
        `<div class="moderator__body__user" data-section=${elem.login}>
    
            <div class="moderator__body__login">
                ${elem.login}
            </div>
            <div class="moderator__body__role">
            
                 <select class='select-user-role'>
                    ${res}
                </select>
            </div>
    </div>`
      );
    });

    if (result.length >= this.perPage) {
      addActive(more);
    } else {
      removeActive(more);
    }
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    this.element?.removeEventListener('click', this.moderEvent);
  }
}
