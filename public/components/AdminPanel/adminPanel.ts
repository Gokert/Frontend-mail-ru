import { Component } from '@components/component';
import * as templateAdminPanel from '@components/AdminPanel/adminPanel.hbs';
import { isPush } from '@utils/std';

/**
 * Класс рендеринга панели админа
 * @class AdminPanel
 * @typedef {AdminPanel}
 */
export class AdminPanel extends Component {
  private adminPanelEvent;

  /**
   * Метод рендеринга элемента
   * @param result
   * @return {string} html авторизации
   */
  render () {
    this.element = this.createHTMLElement(templateAdminPanel(), '.admin-panel');
    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    this.addPanelEvent();
  }

  /**
   * Активация кнопки добавления фильма
   */
  setAddFilm () {
    const selected = this.element.querySelector('.admin-panel__add-film');
    selected?.classList.add('active');
  }

  /**
   * Активация кнопки модератора
   */
  setModeratorPanel () {
    const selected = this.element.querySelector('.admin-panel__moder');
    selected?.classList.add('active');
  }

  /**
   * Добавление обработчика событий
   */
  addPanelEvent () {
    this.adminPanelEvent = (event) => {
      switch (true) {
        case isPush(event, '.admin-panel__add-film'):
          this.renderNewPage('/admin', `/addFilm`);
          break;
        case isPush(event, '.admin-panel__moder'):
          this.renderNewPage('/admin', '/moderators');
          break;
        default:
          break;
      }
    };
    this.element?.addEventListener('click', this.adminPanelEvent);
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    const adminPanel = this.element.querySelector('.admin-panel');
    adminPanel?.removeEventListener('click', this.adminPanelEvent);
  }
}
