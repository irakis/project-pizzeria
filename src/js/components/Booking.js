//import { render } from 'sass';
import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){

    console.log(element);
    this.render(element);
    this.initWidgets();
    this.getData();
  }

  getData() {
    const thisBooking = this;

    console.log(settings.db.dateStartParamKey);
    //console.log(this.dataPicker.minDate);

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    console.log('get Data params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventRepeat),
    ])
    
      .then(function(allResponses){
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]); 
      })
      .then(function([bookings]){
        console.log(bookings);

      });
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