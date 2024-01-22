import { View } from '@views/view';
import { responseStatus, ROOT } from '@utils/config';
import { store } from '@store/store';
import {
  actionAlreadyWatched,
  actionUserStatistic
} from '@store/action/actionTemplates';
import { UserStatistic } from '@components/UserStatistic/userStatistic';
import { FilmSelection } from '@components/FilmSelection/filmSelection';
import { Slider } from '@components/Slider/slider';
import { searchData } from '@utils/searchData';

/**
 * Класс формирование страницы статистики юзера
 * @class UserStatisticPage
 * @typedef {UserStatisticPage}
 */
export class UserStatisticPage extends View {
  private statistic: UserStatistic;

  /**
   * Метод создания страницы
   */
  render () {
    this.renderDefaultPage();
    this.element = <HTMLElement>document.querySelector('main');
    this.componentDidMount();
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    const contentBlock = this.element.querySelector('.content-block');

    contentBlock?.insertAdjacentHTML(
      'beforeend',
      '<div class="statistic"></div>'
    );
    contentBlock?.insertAdjacentHTML(
      'beforeend',
      '<div class="already-viewed"></div>'
    );

    this.statistic = new UserStatistic(ROOT);
    store.dispatch(actionUserStatistic()).then(() => {
      const data = store.getState('userStatistic');

      if (data?.status === responseStatus.success) {
        this.element
          .querySelector('.statistic')
          ?.appendChild(this.statistic.render(data.body));
      }
    });

    store.dispatch(actionAlreadyWatched()).then(() => {
      this.addWathedFilms();
    });
  }

  /**
   * Метод добавлния просмотренных фильмов на страницу
   */
  addWathedFilms () {
    const result = store.getState('alreadyWatched');

    if (result?.status === responseStatus.success) {
      const slider = new Slider(ROOT);
      const statHTML = this.element.querySelector('.already-viewed');
      statHTML?.appendChild(
        slider.render(searchData.addFilmsToHTML(result.body.films))
      );

      const filmSelect = new FilmSelection(ROOT);
      slider.setHeader(filmSelect.render('Последние просмотренные'));

      if (result.body.films.length === 0) {
        const select = this.element.querySelector('.film-selection_films');
        select?.insertAdjacentHTML(
          'beforeend',
          `<div class="label">Просмотренных ещё нет</div>`
        );
      }
    }
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    this.statistic.ComponentWillUnmount();
  }
}
