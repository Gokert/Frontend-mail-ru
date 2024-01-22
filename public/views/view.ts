import { Component } from '@components/component';
import { footer, header, ROOT } from '@utils/config';
import { Footer } from '@components/Footer/footer';
import { ContentBlock } from '@components/ContentBlock/contentBlock';
import { router } from '@router/router';

/**
 * Родитель всех страниц
 * @class View
 * @typedef {View}
 */
export class View extends Component {
  /**
   * Метод дефолтной страницы
   * @param isMain
   * @param renderContent
   */
  renderDefaultPage (isMain = false, renderContent = true) {
    let main = document.querySelector('main');

    if (!document.querySelector('header')) {
      ROOT?.appendChild(<HTMLElement>header.render());
    } else {
      main!.innerHTML = '';
    }

    if (main == null) {
      main = document.createElement('main');
      ROOT?.appendChild(main);
    }

    if (!document.querySelector('.content-block') && renderContent) {
      const contentBlock = new ContentBlock(ROOT);
      main.insertAdjacentHTML('beforeend', contentBlock.render(isMain));
    }

    if (!document.querySelector('.footer')) {
      main.insertAdjacentHTML('beforeend', footer.render());
    }
  }
}
