import { router } from '@router/router';

export interface Component {
  componentDidMount(any): void;
  componentWillUnmount(): void;
}

/**
 * Класс родитель всех компонентов
 * @class Component
 * @typedef {Component}
 */
export class Component {
  protected rootNode;
  private element_: HTMLElement;

  /**
   * Конструктор для формирования родительского элемента
   * @param ROOT
   * @class
   */
  constructor (ROOT) {
    this.rootNode = ROOT;
  }

  /**
   * Получение текущего HTML элемента
   */
  get element () {
    return this.element_;
  }

  /**
   * Установка HTML элемента
   */
  set element (elem) {
    this.element_ = elem;
  }

  /**
   * Переход на новую страниту
   * @param path
   * @param props
   */
  renderNewPage (path: string, props = '') {
    router.go(
      {
        path: path,
        props: props
      },
      { pushState: true, refresh: false }
    );
  }

  /**
   * Создание текущего HTML элемента
   * @param HTMLString
   * @param HTMLName
   */
  createHTMLElement (HTMLString, HTMLName) {
    const parser = new DOMParser();
    return <HTMLElement>(
      parser.parseFromString(HTMLString, 'text/html').querySelector(HTMLName)
    );
  }
}
