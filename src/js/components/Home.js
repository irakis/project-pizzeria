import { templates, select } from '../settings.js';
import utils from '../utils.js';
import Carousel from './Carousel.js';

class Home {
  constructor(element) {

    console.log('element w Home: ', element);
    this.render(element);
    this.initWidgets();
  }

  render() {

    const thisHome = this;
    const generatedHTML = templates.homeWidget();
    const elementDom = utils.createDOMFromHTML(generatedHTML);
    console.log('elementDom w Home: ', elementDom);

    thisHome.dom = {};
    thisHome.dom.wrapper = document.querySelector(select.containerOf.home);
    thisHome.dom.homeWidget = document.querySelector(select.containerOf.homeWidget);

    thisHome.dom.wrapper.appendChild(elementDom);
  }

  initWidgets() {
    const thisHome = this;
    new Carousel(thisHome.dom.homeWidget, {
      autoPlay: true,
      wrapAround: true,
      cellAlign: 'center',
      contain: true,
    });
  }
}

export default Home;