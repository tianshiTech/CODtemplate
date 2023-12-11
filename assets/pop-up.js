var commonCurrency;
(function () {
  let result = new URLSearchParams(window.location.search);
  let source = result.get('source');
  let currencyValue = Shopify?.currency?.active
  commonCurrency = currencyList[currencyValue] ? currencyList[currencyValue] : currencyValue
  let LText = languageData[currencyValue] || languageData.RON

  let xhr = new window.XMLHttpRequest();
  if (!window.XMLHttpRequest) {
    try {
      xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) { }
  }

  // 产品数据
  let productList = []

  // 购买按钮
  let buyBtn = document.querySelector('.cod_checkout_btn');
  let buyBottomBtn = document.querySelector('.cod_bottom_button');

  // 下单按钮点击事件
  buyBtn.addEventListener('click', (e) => {
    clickBuyBtn()
  })
  buyBottomBtn.addEventListener('click', (e) => {
    clickBuyBtn()
  })

  // 添加下单弹窗
  function clickBuyBtn() {
    // 变体数据
    let variantRadios = document.getElementsByTagName('variant-radios')[0]
    let variantData = JSON.parse(variantRadios.querySelector('[type="application/json"]').textContent) || [];

    if (buyBtn.className.indexOf('loading_btn') > 0 || buyBottomBtn.className.indexOf('loading_btn') > 0) {
      return false
    }
    buyBtn.className += ' loading_btn'
    buyBottomBtn.className += ' loading_btn'
    buyBtn.querySelector('.cod_loading_icon').style.display = 'flex'
    buyBottomBtn.querySelector('.cod_loading_icon').style.display = 'flex'

    //购物车页面
    if (window.location.pathname.indexOf('/cart') > -1) {
      Promise.all([getCart()]).then(res => {
        let [data] = res;
        getProductList(data)
        closeLoading('1')
      })
    } else {
      let result = new URLSearchParams(window.location.search);
      let variant = result.get('variant');
      let variant_id = ''
      // 产品详情页
      if (window.location.pathname.indexOf('/products/') > -1) {
        if (variant) {
          variant_id = variant
        } else {
          variant_id = variantData.filter(i => i.available)[0].id
        }
      } else {
        // 首页热销品
        // let variantBox = document.querySelector(".product-variant-id")
        let variantBox = document.getElementsByName('id')
        if (variantBox && variantBox.length > 0) {
          variant_id = variantBox[variantBox.length - 1].value
        }
      }
      if (variant_id) {
        let isAvailable = variantData.find(i => i.id == variant_id)?.available
        if (!isAvailable) {
          // timer('售空')
          closeLoading('1')
          return
        }
        let quantityNum = document.querySelector('.quantity__input')?.value || '1'
        Promise.all([clearCart(variant_id, quantityNum)]).then(res => {
          let [data] = res;
          if (data && data.items && data.items.length > 0) {
            data.items = data.items.filter(i => i.id == variant_id)
          }
          getProductList(data)
          closeLoading('1')
        })
      } else {
        closeLoading('1')
      }
    }
  }

  // 关闭Loading按钮
  function closeLoading(dom) {
    if (dom === '1') {
      buyBtn.querySelector('.cod_loading_icon').style.display = 'none'
      buyBottomBtn.querySelector('.cod_loading_icon').style.display = 'none'
      buyBtn.classList.remove('loading_btn')
      buyBottomBtn.classList.remove('loading_btn')
    } else {
      dom.querySelector('.cod_loading_icon').style.display = 'none'
    }
    if (document.querySelector('.pop_up_checkout_btn')) {
      document.querySelector('.pop_up_checkout_btn').className = 'pop_up_checkout_btn'
    }
  }

  // 获取产品数据列表
  function getProductList(data) {
    if (data && data.items && data.items.length > 0) {
      productList = []
      data.items.forEach(item => {
        productList.push({
          product_id: item.product_id,
          quantity: item.quantity,
          title: item.product_title,
          href: item.url,
          img: item.image,
          variant_id: item.variant_id,
          variant_title: item.variant_title,
          price: parseFloat(item.final_line_price / 100),
          // unit: commonCurrency,
          // total_price: parseFloat(data.total_price / 100),
        })
      })
      createPopUp(data.item_count)
    }
  }

  // 创建下单弹窗
  function createPopUp(item_count) {
    let codPopUp = document.createElement('div');
    let productDiv = ''
    productList.forEach(item => {
      productDiv += `<div class="pop_up_product_li">
      <div class="product_img"><img src="${item.img}" /><div class="product_count">${item.quantity}</div></div>
      <div class="product_info">
        <a class="product_info_title" href="${item.href}">${item.title}</a>
        <span class="product_info_variant_name">${item.variant_title}</span>
      </div>
      <div class="product_price">${item.price} ${commonCurrency}</div>
    </div>`
    })
    let total = productList[0].total_price ? productList[0].total_price + ' ' + commonCurrency : productList[0].price + ' ' + commonCurrency
    // <img id='pop_up_close' class="pop_up_close" src="https://platform.antdiy.vip/static/image/close.svg" />
    codPopUp.innerHTML = `<div class="cod_pop_up" id="cod_pop_up" style="direction: ${LText.layoutStyle};">
      <div class="pop_up_box">
        <div class="pop_up_header">
          <span>${LText.popUpHeader}</span>
          <svg id='pop_up_close' class="pop_up_close" width="22px" height="22px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>关闭icon</title>
            <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="相似清单" transform="translate(-1516.000000, -682.000000)" fill="#000000">
                    <g id="编组-18" transform="translate(360.000000, 644.000000)">
                        <g id="编组-15" transform="translate(1156.000000, 38.000000)">
                            <path d="M11.0117187,10 L16.1386719,3.88867188 C16.2246094,3.78710938 16.1523437,3.6328125 16.0195312,3.6328125 L14.4609375,3.6328125 C14.3691406,3.6328125 14.28125,3.67382813 14.2207031,3.74414063 L9.9921875,8.78515625 L5.76367187,3.74414062 C5.70507812,3.67382812 5.6171875,3.6328125 5.5234375,3.6328125 L3.96484375,3.6328125 C3.83203125,3.6328125 3.75976562,3.78710938 3.84570312,3.88867188 L8.97265625,10 L3.84570312,16.1113281 C3.75976562,16.2128906 3.83203125,16.3671875 3.96484375,16.3671875 L5.5234375,16.3671875 C5.61523437,16.3671875 5.703125,16.3261719 5.76367187,16.2558594 L9.9921875,11.2148437 L14.2207031,16.2558594 C14.2792969,16.3261719 14.3671875,16.3671875 14.4609375,16.3671875 L16.0195312,16.3671875 C16.1523437,16.3671875 16.2246094,16.2128906 16.1386719,16.1113281 L11.0117187,10 Z" id="路径" fill-opacity="0.45"></path>
                            <rect id="矩形" fill-rule="nonzero" opacity="0" x="0" y="0" width="20" height="20"></rect>
                        </g>
                    </g>
                </g>
              </g>
          </svg>
        </div>
        <div class="pop_up_product">
          <div class="pop_up_product_list">${productDiv}</div>
          <div class="pop_up_summary">
            <div class="pop_up_summary_line">
              <span class="line_title">Subtotal</span>
              <span class="line_value">${total}</span>
            </div>
            <div class="pop_up_summary_line">
              <span class="line_title">Shipping</span>
              <span class="line_value">${LText.freeText}</span>
            </div>
            <div class="pop_up_summary_line pop_up_summary_bigger">
              <span class="line_title">Total</span>
              <span class="line_value">${total}</span>
            </div>
          </div>
        </div>
        <div class="pop_up_shipping">
          <div class="title">${LText.deliveryText}</div>
          <div class="rates">
            <div class="rates_item_choice"></div>
            <span class="rates_item_title">${LText.freeTranText}</span>
            <span class="price">${LText.freeText}</span>
          </div>
        </div>
        <div class="pop_up_from">
          <div class="pop_up_from_title">${LText.addressText}</div>
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.fullNameText}</span>
              <i>*</i>
            </div>
            <input id="cod_name" type="text" placeholder="${LText.fullNameText}">
            <div id="name_error" class="error_text">${LText.errorText}</div>
          </div>
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.teleText}</span>
              <i>*</i>
            </div>
            <input id="cod_phone" type="text" placeholder="${LText.teleText}">
            <div id="phone_error" class="error_text">${LText.errorText}</div>
          </div>
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.exactText}</span>
              <i>*</i>
            </div>
            <input id="cod_area" type="text" placeholder="${LText.exactPleText}">
            <div id="area_error" class="error_text">${LText.errorText}</div>
          </div>
          ${LText.lType === 'RON' ? `<div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.buildText}</span>
              <i>*</i>
            </div>
            <input id="cod_house_number" type="text" placeholder="${LText.buildText}">
            <div id="house_number_error" class="error_text">${LText.errorText}</div>
          </div>` : ''}
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.countyText}</span>
              <i>*</i>
            </div>
            <input id="cod_state" type="text" placeholder="${LText.countyText}">
            <div id="state_error" class="error_text">${LText.errorText}</div>
          </div>
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.townText}</span>
              <i>*</i>
            </div>
            <input id="cod_city" type="text" placeholder="${LText.townText}">
            <div id="city_error" class="error_text">${LText.errorText}</div>
          </div>
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.postalText}</span>
              <i></i>
            </div>
            <input id="cod_postcode" type="text" placeholder="${LText.postalText}">
          </div>
          <div class="pop_up_from_item">
            <div class="item_title">
              <span>${LText.emailText}</span>
              <i></i>
            </div>
            <input id="cod_email" type="text" placeholder="${LText.emailText}">
            <div id="email_error" class="error_text">${LText.emailError}</div>
          </div>
        </div>
        <div class="pop_up_checkout_btn" id="pop_up_checkout_btn">${LText.orderBtn} - ${total}<div class="cod_loading_icon"><img src="https://platform.antdiy.vip/static/image/hydrogen_loading.gif" /></div></div>
      </div>
    </div>`
    document.body.appendChild(codPopUp)

    // 点击关闭按钮
    let closePopUp = document.getElementById('pop_up_close')
    closePopUp.addEventListener('click', () => {
      codPopUp.remove()
    })

    // 控制输入数字
    let codPostCode = document.querySelector(`#cod_postcode`)
    let codPhone = document.querySelector(`#cod_phone`)
    const regex = /[^0-9]/g;
    codPostCode.addEventListener('input', function (event) {
      codPostCode.value = codPostCode.value.replace(regex, '');
    });
    codPhone.addEventListener('input', function (event) {
      codPhone.value = codPhone.value.replace(regex, '');
    });

    clickOrderBtn()
  }

  // 点击下单按钮
  function clickOrderBtn() {
    let checkoutBtn = document.getElementById('pop_up_checkout_btn')
    checkoutBtn.addEventListener('click', () => {
      if (checkoutBtn.className.indexOf('loading_btn') > 0) {
        return false
      }
      checkoutBtn.className += ' loading_btn'
      checkoutBtn.querySelector('.cod_loading_icon').style.display = 'flex'
      let params = {
        count: 1,
        shop: Shopify.shop,
        country: Shopify.country,
        country_code: 'RON',
        name: document.getElementById('cod_name').value,
        phone: document.getElementById('cod_phone').value,
        area: document.getElementById('cod_area').value,
        state: document.getElementById('cod_state').value,
        city: document.getElementById('cod_city').value,
        postcode: document.getElementById('cod_postcode').value,
        email: document.getElementById('cod_email').value.replace(/^\s*|\s*$/g, ''),
      }
      if (LText.lType === 'RON') {
        params.house_number = document.getElementById('cod_house_number').value
      }
      let isPass = true

      for (let key in params) {
        if (key != 'postcode' && key != 'email' && !params[key]) {
          verifyForm(key)
          isPass = false
          closeLoading(checkoutBtn)
        }
      }
      // if (params.phone && params.phone.length < 10){
      //   verifyForm('phone', true)
      //   isPass = false
      //   closeLoading(checkoutBtn)
      // }
      if (isPass) {
        let line_items = []
        let product_list = []
        productList.forEach(item => {
          line_items.push({
            product_id: item.product_id,
            quantity: item.quantity,
            variant_id: item.variant_id,
          })
          product_list.push({
            img_url: item.img,
            title: item.title,
            variantTitle: item.variant_title,
            price: item.price,
            product_id: item.product_id,
            quantity: item.quantity,
            variant_id: item.variant_id,
          })
        })
        params.line_items = line_items
        params.product_list = product_list
        params.source = source
        params.tags = LText.lType
        params.route = 2

        xhr.open("post", `https://gateway.antdiy.vip/account-service/media_orders/create/async/pass`);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.response) {
              let res = JSON.parse(xhr.response)
              if (res.success && res?.data?.order?.id) {
                let contents = line_items.map(item => {
                  return {
                    id: item.variant_id,
                    quantity: item.quantity,
                  }
                })
                sendFbq(
                  'Purchase',
                  {
                    content_type: 'product',
                    contents: contents,
                    value: product_list[0].price,
                    currency: currencyValue,
                  },
                  {
                    eventID: (new Date).getTime() + ""
                  }
                )
                window.open(`/pages/thank_you?id=${res?.data?.order?.id}`, '_self')
              } else {
                timer(res.msg || LText.orderError)
              }
            }
            closeLoading(checkoutBtn)
          }
        }
        xhr.send(JSON.stringify(params));
      }
    })
  }

  // 验证表单信息错误
  function verifyForm(key, value) {
    let errorBox = document.getElementById(`${key}_error`)
    let errorInp = document.getElementById(`cod_${key}`)
    if (errorBox) {
      if (value) {
        errorBox.innerHTML = LText.phoneErrorText
      } else {
        errorBox.innerHTML = LText.errorText
      }
      errorBox.style.display = 'block'
    }
    if (errorInp) {
      errorInp.className = 'cod_error'
      errorInp.addEventListener('input', function () {
        errorInp.className = ''
        errorBox.style.display = 'none'
      })
    }
  }

  // 定时错误弹窗
  function timer(msg) {
    let messageBox = document.createElement('div')
    messageBox.className = 'pop_up_message'
    messageBox.innerHTML = msg
    document.body.appendChild(messageBox)
    var count = 2;
    let countdown = setInterval(function () {
      count--;
      if (count < 1) {
        clearInterval(countdown);
        return messageBox.remove()
      }
    }, 800)
  }

  // 获取购物车接口
  function getCart() {
    return new Promise(resolve => {
      xhr.open("get", `${window.location.origin}/cart.js?timestamp=${Date.parse(new Date())}`);
      xhr.onreadystatechange = () => {
        if (xhr.response) {
          let res = JSON.parse(xhr.response)
          resolve(res);
        }
      }
      xhr.send();
    });
  }

  // 清空购物车接口
  function clearCart(id, quantityNum) {
    return new Promise(resolve => {
      xhr.open("post", `${window.location.origin}/cart/clear.js`);
      xhr.onreadystatechange = () => {
        if (xhr.response) {
          let res = JSON.parse(xhr.response)
          if (id) {
            updateCart(id, quantityNum).then(reso => {
              resolve(reso)
            })
          } else {
            resolve(res);
          }
        }
      }
      xhr.send();
    });
  }

  // 更新购物车接口
  function updateCart(id, quantityNum) {
    let obj = {};
    obj[id] = quantityNum;
    return new Promise(resolve => {
      xhr.open("post", `${window.location.origin}/cart/update.js`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = () => {
        if (xhr.response) {
          let res = JSON.parse(xhr.response)
          resolve(res);
          cartCreat()
          sendFbq('AddToCart')
        }
      }
      xhr.send(JSON.stringify({ updates: obj }));
    });
  }

  // 循环间隔动画效果
  if (buyBtn.classList && buyBtn.classList.length > 0) {
    setInterval(() => {
      if (buyBtn.className.indexOf('animate__animated') > -1) {
        buyBtn.classList.remove('animate__animated')
        buyBtn.classList.remove('animate__tada')
      } else {
        buyBtn.classList.add('animate__animated')
        buyBtn.classList.add('animate__tada')
      }
    }, 2000)
  }

  // 判断按钮距离顶部距离
  if (window.location.pathname.indexOf('/products/') > -1 && window.screen.width < 500) {
    window.addEventListener('scroll', function () {
      //检测滚走的高度
      let codBottomButton = document.querySelector('.cod_bottom_button')
      var offsetT = buyBtn.getBoundingClientRect().top;
      if (offsetT < -50) {
        codBottomButton.style.display = 'flex'
      } else {
        codBottomButton.style.display = 'none'
      }
    });
  }
  // 加购记录
  if (getReferer() && getReferer().split('.com')[0].indexOf(window.location.host.split('.com')[0]) === -1 && (!localStorage.getItem('refererName') || (localStorage.getItem('refererName') && localStorage.getItem('refererName') !== getReferer()))) {
    localStorage.setItem('refererName', getReferer())
  }
  function cartCreat() {
    if (window.location.pathname.indexOf('/products/') > -1 && source && localStorage.getItem('refererName')) {
      let params = {
        source: source,
        url: window.location.href,
      }
      xhr.open("post", `https://gateway.antdiy.vip/account-service/media_orders/cart_creat/pass`);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.onreadystatechange = () => {
        if (xhr.response) {
          // console.log(JSON.parse(xhr.response))
        }
      }
      xhr.send(JSON.stringify(params));
    }
  }

  // 获取referrer
  function getReferer() {
    if (document.referrer) {
      return document.referrer;
    } else {
      return false;
    }
  }

  // FBQ
  function sendFbq(a, b, c) {
    if ("function" == typeof window.fbq) {
      window.fbq("track", a, b, c)
    }
  }
}())