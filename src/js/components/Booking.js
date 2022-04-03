//import { render } from 'sass';
import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    this.dom.datePicker = elementDom.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = elementDom.querySelector(select.widgets.hourPicker.wrapper);

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
    new DatePicker(this.dom.datePicker);
    new HourPicker(this.dom.hourPicker);

  }
}
export default Booking;