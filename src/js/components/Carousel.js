import Home from "./Home.js";
import utils from "../utils.js";
import { templates, select } from '../settings.js';

class Carousel {
    constructor(element) {
        
        const thisCarousel = this;
        this.render();
        this.initPlugin();
       
    }

    render(element) {

        const thisCarousel = this;
        const generatedHTML = templates.homeWidget();
        const elementDom = utils.createDOMFromHTML(generatedHTML);
        console.log('elementDom w Home: ', elementDom);

        thisCarousel.dom = {}
        thisCarousel.dom.homeWidget = document.querySelector(select.containerOf.homeWidget);
        console.log(thisCarousel.dom);
    }

    initPlugin() {
       // console.log(thisCarousel.dom);
        const elem = thisCarousel.dom.homeWidget;
        const flkty = new Flickity(elem, {options});
    }
}

//export default Carousel