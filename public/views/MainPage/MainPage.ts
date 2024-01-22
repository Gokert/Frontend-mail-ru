import { View } from '@views/view';
import { ROOT } from '@utils/config';
import { Calendar } from '@components/Calendar/calendar';
import { Slider } from '@components/Slider/slider';
import { store } from '@store/store';
import {
  actionCollectionMain,
  actionGetCalendar,
  actionGetTrends
} from '@store/action/actionTemplates';
import { searchData } from '@utils/searchData';
import { FilmSelection } from '@components/FilmSelection/filmSelection';
import { StartVideo } from '@components/StartVideoContainer/startVideoConrainer';

/**
 * Класс формирования главной страницы
 * @class MainPage
 * @typedef {MainPage}
 */
export class MainPage extends View {
  /**
   * Метод создания страницы
   */
  render () {
    this.renderDefaultPage(true);
    const contentBlockHTML = document.querySelector('.content-block');
    const mainHTML = document.querySelector('main');

    const video = new StartVideo(ROOT);
    mainHTML?.insertBefore(video.render(), mainHTML.firstChild);

    const slider = new Slider(ROOT, 'commercial');
    const commercial = contentBlockHTML?.querySelector('.commercial');
    commercial?.appendChild(slider.render(''));

    const sliderNews = new Slider(ROOT);
    store.dispatch(actionCollectionMain({ collection_id: 0 })).then((res) => {
      const films = store.getState('collectionMain');
      const news = contentBlockHTML?.querySelector('.news');
      news?.appendChild(
        sliderNews.render(searchData.addFilmsToHTML(films.body.films))
      );

      const filmSelect = new FilmSelection(ROOT);
      sliderNews.setHeader(filmSelect.render('Новинки'));
    });

    const sliderTrends = new Slider(ROOT);
    store.dispatch(actionGetTrends()).then((res) => {
      const films = store.getState('getTrends');
      const trends = contentBlockHTML?.querySelector('.trends');
      trends?.appendChild(
        sliderTrends.render(searchData.addFilmsToHTML(films.body.films))
      );

      const filmSelect = new FilmSelection(ROOT);
      sliderTrends.setHeader(filmSelect.render('В Тренде'));
    });

    store.dispatch(actionGetCalendar()).then((res) => {
      const calendar = new Calendar(ROOT);
      contentBlockHTML?.appendChild(
        calendar.render(store.getState('calendarInfo')?.body)
      );
    });
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {}

  /**
   * Метод очистки
   */
  componentWillUnmount () {}
}
