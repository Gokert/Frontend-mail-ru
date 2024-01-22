import * as templateSlider from '@components/Slider/slider.hbs';
import * as templateSliderLine from '@components/Slider/sliderLine.hbs';
import { Component } from '@components/component';

export interface Slider {
  state: {
    slideIndex: number;
    prevHTML: any;
    nextHTML: any;
    sliderHTML: any;
    containerHTML: any;
    target: string;
  };
}

/**
 * Класс рендеринга слайдера
 * @class Slider
 * @typedef {Slider}
 */
export class Slider extends Component {
  constructor (ROOT, target = 'default') {
    super(ROOT);
    this.state = {
      slideIndex: 0,
      prevHTML: '',
      nextHTML: '',
      containerHTML: '',
      sliderHTML: '',
      target: target
    };
  }

  /**
   * Метод рендеринга слайдера
   * @param data
   * @returns {string} html слайдера
   */
  render (data) {
    if (this.state.target === 'commercial') {
      this.element = this.createHTMLElement(
        templateSlider(),
        '.slideshow-container'
      );
    } else {
      this.element = this.createHTMLElement(
        templateSliderLine(),
        '.slider-full'
      );
      this.insertDataToSlider(data);
    }

    this.componentDidMount();
    return this.element;
  }

  /**
   * Метод инициализации страницы
   */
  componentDidMount () {
    if (this.state.target === 'commercial') {
      this.showSlidesAuto();
    } else {
      this.showSliders();
    }
  }

  /**
   * Метод добавления данных в слайдер
   * @param data массив HTML элементов
   */
  insertDataToSlider (data) {
    const current = this.element.querySelector('.slider-container');
    data.forEach((value) => {
      current?.appendChild(value);
    });
  }

  /**
   * Метод прокручивания слайда рекламы
   */
  showSlidesAuto () {
    this.element.querySelector('.banner-container')?.remove();

    const slides = Array.from(
      this.element.getElementsByClassName('mySlides')
    ) as HTMLElement[];
    slides.forEach((slide) => {
      slide.style.display = 'none';
    });

    this.state.slideIndex++;
    if (this.state.slideIndex > slides.length) {
      this.state.slideIndex = 1;
    }

    try {
      slides[this.state.slideIndex - 1].style.display = 'block';
      setTimeout(this.showSlidesAuto.bind(this), 7000);
    } catch {
      console.error('Show sliders error');
    }
  }

  /**
   * Метод установления заголовка слайдера
   * @param text
   */
  setHeader (text) {
    this.element.querySelector('.slider-name')?.appendChild(text);
    this.resizeEvent();
  }

  /**
   * Метод прокручивания слайдера
   */
  showSliders () {
    this.state.sliderHTML = this.element.querySelector('.slider-container');
    this.state.prevHTML = this.element.querySelector('.line-prev');
    this.state.nextHTML = this.element.querySelector('.line-next');

    this.state.prevHTML?.addEventListener('click', () => {
      this.state.sliderHTML.style.scrollBehavior = 'smooth';
      this.state.sliderHTML.scrollLeft -= 280;
    });

    this.state.nextHTML?.addEventListener('click', () => {
      this.state.sliderHTML.style.scrollBehavior = 'smooth';
      this.state.sliderHTML.scrollLeft += 280;
    });

    this.state.containerHTML = this.element.querySelector('.slider');
    window.addEventListener('resize', this.resizeEvent.bind(this));
  }

  /**
   * Метод очистки
   */
  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeEvent.bind(this));
  }

  /**
   * Метод добавления/удаления кнопок прокрутки при изменении размера страницы
   */
  resizeEvent () {
    if (
      this.state.sliderHTML.offsetWidth <
        this.state.containerHTML.offsetWidth ||
      window.innerWidth <= 500
    ) {
      this.state.prevHTML.style.display = 'none';
      this.state.nextHTML.style.display = 'none';
    } else {
      this.state.prevHTML.style.display = 'block';
      this.state.nextHTML.style.display = 'block';
    }
  }
}
