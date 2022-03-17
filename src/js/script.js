/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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

      /* generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
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

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          //check if paramId.optionId is marker on formData

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

      app.cart.add(thisProduct.prepareCartProduct());
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


  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initAction();

    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      /*TODO : Add validation*/
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue <= (settings.amountWidget.defaultMax + 1) && newValue >= (settings.amountWidget.defaultMin - 1)) {

        thisWidget.value = newValue;

        thisWidget.input.value = thisWidget.value;

        thisWidget.announce();

      } else {
        thisWidget.input.value = thisWidget.value;
      }
    }

    initAction() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {

        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);

      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }
    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', { 
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }
  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initAction();
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {},
      thisCart.dom.wrapper = element,
      thisCart.dom.toggleTrigger = document.querySelector(select.cart.toggleTrigger),
      thisCart.dom.productList = document.querySelector(select.cart.productList),
      thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee),
      thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice),
      thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice),
      thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);

    }
    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }

    initAction() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function() {
        thisCart.remove(CustomEvent);
      });
    }
    update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      console.log('thisCart.products',thisCart.products);

      for(let cartProduct of thisCart.products){
        thisCart.totalNumber = cartProduct.amount + thisCart.totalNumber;
        thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

        thisCart.subtotalPrice = cartProduct.price + thisCart.subtotalPrice;
        thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      }
      
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;

      if(thisCart.totalNumber == 0) {
        thisCart.totalPrice == 0,
        thisCart.subtotalPrice == 0;
      }else {
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      }

      for(let totalPrices of thisCart.dom.totalPrice){
        totalPrices.innerHTML = thisCart.totalPrice;
        console.log('loop totalPrice', totalPrices);
      }
      
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    }
    remove() {
      const thisCart = this;
      console.log(thisCart);

      thisCart.dom.productList.addEventListener('remove', function (){
        console.log('listener works?');

        const thisCartProductRemove = thisCart.products.indexOf(event.detail.cartProduct);
        console.log('product to remove',thisCartProductRemove);
        

        thisCart.products.splice(thisCartProductRemove, 1);
        console.log(thisCart.products);

        thisCart.update();
      });
      
    }
  }
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id,
      thisCartProduct.name = menuProduct.name,
      thisCartProduct.amount = menuProduct.amount,
      thisCartProduct.priceSingle = menuProduct.priceSingle,
      thisCartProduct.price = menuProduct.price,
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initAction();

    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element,
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget),
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price),
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit),
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {

        thisCartProduct.amount = thisCartProduct.amountWidget.value;  
        
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
                
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove() {
      const thisCartProduct = this;
      console.log(thisCartProduct);

      const event = new CustomEvent('remove',{
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      thisCartProduct.dom.wrapper.remove();
    }
    initAction() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event) {
        event.preventDefault();
        thisCartProduct.remove(event);
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

    }
  };

  app.init();

}
