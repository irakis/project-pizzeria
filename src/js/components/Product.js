import{select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

class Product {
  constructor(id, data) {

    const thisProduct = this;

    thisProduct.id = id;

    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProduct();

  }

  renderInMenu() {
    const thisProduct = this;

    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);

  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    thisProduct.accordionTrigger.addEventListener('click', function (event) {

      event.preventDefault();

      const activeProduct = document.querySelectorAll(select.all.menuProducts);

      for (let activeOneProduct of activeProduct) {

        if (activeOneProduct != thisProduct.element) {

          activeOneProduct.classList.remove('active');

        } else thisProduct.element.classList.toggle('active');
      }
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);

    let price = thisProduct.data.price;

    for (let paramId in thisProduct.data.params) {

      const param = thisProduct.data.params[paramId];

      for (let optionId in param.options) {

        const option = param.options[optionId];

        const cathegorySelected = formData.hasOwnProperty(paramId);

        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        if (cathegorySelected === true && optionImage !== null) {

          const optionSelected = formData[paramId].includes(optionId);

          optionImage.classList.add(classNames.menuProduct.imageVisible);

          if (optionSelected === true && option.default !== true) {

            const priceOption = option.price;

            price += priceOption;

          } else if (optionSelected !== true && option.default === true) {

            const priceOption = option.price;

            price -= priceOption;

            optionImage.classList.remove(classNames.menuProduct.imageVisible);

          } else if (optionSelected !== true && option.default !== true) {

            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;

    price *= thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct()
      },
    });
    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id,
    productSummary.name = thisProduct.data.name,
    productSummary.amount = thisProduct.amountWidget.value,
    productSummary.priceSingle = thisProduct.priceSingle,
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value,
    productSummary.params = thisProduct.prepareCardProductParams();

    return productSummary;
  }

  prepareCardProductParams() {

    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};


    for (let paramId in thisProduct.data.params) {

      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {}
      };
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {

          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}
export default Product;