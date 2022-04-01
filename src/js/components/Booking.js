//import { render } from 'sass';
import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){

    console.log(element);
    this.render(element);
    this.initWidgets();
  }

  render(element) {
    //const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    const elementDom = utils.createDOMFromHTML(generatedHTML);

    this.dom = {};
    this.dom.wrapper = element;
    this.dom.peopleAmount = elementDom.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = elementDom.querySelector(select.booking.hoursAmount);

    element.appendChild(elementDom); 
    console.log(this.dom);
  }

  initWidgets() {

    console.log('amount Widget działa');
    console.log(this.dom.peopleAmount);
    
    const peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    console.log(peopleAmountWidget);

    //peopleAmountWidget.addEventListener('click', function(){});

    const hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    console.log(hoursAmountWidget);

    //hoursAmountWidget.addEventListener('click', function(){});

  }
}
export default Booking;