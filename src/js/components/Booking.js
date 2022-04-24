//import { render } from 'sass';
import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {

    this.render(element);
    this.initWidgets();
    this.getData();
    this.initTables();
    this.choosenTable = '';
    console.log('zmienna choosenTable', this.choosenTable);

  }

  getData() {
    const thisBooking = this;

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

    const urls = {
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventRepeat),
    ])

      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([booking, eventsCurrent, eventRepeat]) {
        thisBooking.parseData(booking, eventsCurrent, eventRepeat);
      });
  }

  parseData(booking, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of booking) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {

        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (!allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    const elementDom = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.peopleAmount = elementDom.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = elementDom.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = elementDom.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = elementDom.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = elementDom.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = elementDom.querySelector(select.booking.floorPlan);
    thisBooking.dom.phone = elementDom.querySelector(select.cart.phone);
    thisBooking.dom.address = elementDom.querySelector(select.cart.address);
    thisBooking.dom.starters = elementDom.querySelectorAll(select.booking.checkbox);
    thisBooking.dom.tableSubmit = elementDom.querySelector(select.booking.forSubmit);


    element.appendChild(elementDom);
  }

  initWidgets() {

    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      thisBooking.resetTable();
    });
    thisBooking.dom.tableSubmit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTables() {
    const thisBooking = this;
    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.resetTable();

      console.log(thisBooking);

      const clickedTable = parseInt(event.target.getAttribute('data-table'));

      if (event.target.classList.contains('table') && !event.target.classList.contains('booked')) {
        event.target.classList.add(classNames.booking.selected);

        thisBooking.choosenTable = clickedTable;

      } else if (event.target.classList.contains('booked')) {
        window.alert('Stolik niedostępny.');
      }
    });
  }
  resetTable() {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.selected);
    }
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.choosenTable,
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    for (let starter of thisBooking.dom.starters) {
      if (starter.checked == true) {
        payload.starters.push(starter.value);
      }
    }
    thisBooking.booked[thisBooking.date][thisBooking.hour].push(thisBooking.choosenTable);

    console.log('payload', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {

        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
        thisBooking.resetTable();
        console.log('parsedResponse', parsedResponse);
      });
  }
}
export default Booking;