import utils from '../utils.js';
import { templates, select } from '../settings.js';

class Carousel {
  constructor(element, options) {
        
    //const thisCarousel= this;
    this.render(element);
    this.initPlugin(options);
       
  }

  render() {

    const thisCarousel = this;
    const generatedHTML = templates.homeWidget();
    const elementDom = utils.createDOMFromHTML(generatedHTML);
    console.log('elementDom w Home: ', elementDom);

    thisCarousel.dom = {};
    thisCarousel.dom.homeWidget = document.querySelector(select.containerOf.homeWidget);
    console.log(thisCarousel.dom.homeWidget);
  }

  initPlugin(options) {

    const thisCarousel = this;
    console.log(thisCarousel.dom);
    const elem = thisCarousel.dom.homeWidget;
    new Flickity(elem, options);
  }
}

export default Carousel;