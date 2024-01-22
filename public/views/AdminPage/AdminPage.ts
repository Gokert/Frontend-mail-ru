import { View } from '@views/view';
import { AdminPanel } from '@components/AdminPanel/adminPanel';
import { ROOT } from '@utils/config';
import { AddFilm } from '@components/AddFilm/addFilm';
import { ModeratorPanel } from '@components/ModeratorPanel/moderatorPanel';

export interface AdminPage {
  state: {
    errorsHTML: {};
    wraps: {};
    inputsHTML: {};
    pageNumber: number;
    perPage: number;
    file: any;
    defaultImage: any;
    currentPage: any;
  };
}

/**
 * Класс формирование страницы админки
 * @class AdminPage
 * @typedef {AdminPage}
 */
export class AdminPage extends View {
  private moderEvent;

  /**
   * Конструктор класса
   * @param ROOT
   */
  constructor (ROOT) {
    super(ROOT);
    this.state = {
      errorsHTML: {},
      wraps: {},
      inputsHTML: {},
      pageNumber: 1,
      perPage: 20,
      file: '',
      defaultImage: '',
      currentPage: ''
    };
  }

  /**
   * Метод создания страницы
   * @param props
   */
  render (props) {
    this.renderDefaultPage();
    this.element = <HTMLElement>document.querySelector('.content-block');
    document.querySelector('.footer')?.remove();
    const addFilm = new AddFilm(ROOT);
    const adminPanel = new AdminPanel(ROOT);
    const moderatorPanel = new ModeratorPanel(ROOT);
    this.element?.appendChild(adminPanel.render());
    this.element?.appendChild(addFilm.render());
    this.element?.appendChild(moderatorPanel.render());

    let button;
    if (props === '/addFilm') {
      adminPanel.setAddFilm();
      button = this.element.querySelector('.add-film');
    } else if (props === '/moderators') {
      adminPanel.setModeratorPanel();
      button = this.element.querySelector('.moderator');
    }

    button?.classList.remove('noactive');
    this.componentDidMount();
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {}

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    const moderatorSearch = this.element.querySelector('.moderator');
    moderatorSearch?.removeEventListener('click', this.moderEvent);
  }
}
