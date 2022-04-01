import{settings, select, templates, classNames} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

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
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber),
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.address = document.querySelector(select.cart.address);
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
    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let cartProduct of thisCart.products){
      thisCart.totalNumber = cartProduct.amount + thisCart.totalNumber;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.subtotalPrice = cartProduct.price + thisCart.subtotalPrice;
    }
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice; 
    thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;

    if(thisCart.totalNumber == 0) {
      thisCart.totalPrice == 0,
      thisCart.subtotalPrice == 0;
    }else {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    }
    for(let totalPrices of thisCart.dom.totalPrice){
      totalPrices.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }

  remove(event) {
    const thisCart = this;
    const thisCartProductRemove = thisCart.products.indexOf(event.detail.cartProduct);
    thisCart.products.splice(thisCartProductRemove, 1);
    thisCart.update();       
  }
  
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address :thisCart.dom.address.value,
      phone : thisCart.dom.phone.value,
      totalPrice : thisCart.totalPrice,
      subtotalPrice : thisCart.subtotalPrice,
      totalNumber : thisCart.totalNumber,
      deliveryFee : settings.cart.defaultDeliveryFee,
      products : [],
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log(payload);
    const options = {
      method : 'POST',
      headers : {
        'Content-Type':'application/json',
      },
      body : JSON.stringify(payload),
    };
    fetch(url,options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}
export default Cart;