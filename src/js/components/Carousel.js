import utils from '../utils.js';
import { templates, select } from '../settings.js';
import Home from './Home.js';

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
    console.log(thisCarousel.dom);
  }

  initPlugin() {
    console.log(thisCarousel.dom);
    var elem = thisCarousel.dom.homeWidget;
    var flkty = new Flickity(elem, options);
  }
}

export default Carousel;