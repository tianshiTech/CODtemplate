(function () {
  let currencyValue = Shopify?.currency?.active
  let commonCurrency = currencyList[currencyValue] ? currencyList[currencyValue] : currencyValue
  let LText = languageData[currencyValue] || languageData.RON
  let xhr = new window.XMLHttpRequest();
  if (!window.XMLHttpRequest) {
    try {
      xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) { }
  }
  let result = new URLSearchParams(window.location.search);
  let order_id = result.get('id')
  let orderBox = document.querySelector('.settle_accounts')
  let orderData = {}
  let productData = null

  if (window.location.pathname.indexOf('/pages/thank_you') > -1) {
    getOrderData()
  }

  // 获取订单数据
  function getOrderData() {
    xhr.open("get", `https://gateway.antdiy.vip/account-service/media_orders/pass/${order_id}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.response) {
          let res = JSON.parse(xhr.response)
          if (res && res.success) {
            let odata = JSON.parse(res?.data?.order_title || '{}')
            orderData = odata?.order || ''
            productData = res?.form?.product_list?.[0]
            setOrderHtml()
          }
        }
      }
    }
    xhr.send();
  }

  // 添加订单box
  function setOrderHtml() {
    orderBox.innerHTML = `
      <div class='product_box thank_product_box' >
        <div class="product_img">
          <img src=${productData?.img_url ?? ''} />
          <div class="product_count">${productData?.quantity ?? ''}</div>
        </div>
        <div class='product_title'>
          <span>${productData?.title ?? ''}</span>
          <span>${productData?.variantTitle ?? ''}</span>
          <span>${commonCurrency} ${parseFloat(productData?.price) ?? ''}</span>
        </div>
      </div>
      <div class='order_box'>
        <div class="section__header">
          <img src="https://platform.antdiy.vip/static/image/cloudstore_steps_finish.svg" />
          <div class="header__heading">
            <span class="order_number">${LText.orders} ${order_id}</span>
            <h2 class="header_title">${LText.thank}</h2>
          </div>
        </div>
        <div class='order_list'>
          <div class='order_list_title'>${LText.request}</div>
          <div class='order_list_text'>${LText.receive}</div>
        </div>
        <div class='order_list'>
          <div class='order_list_title'>${LText.updateOrder}</div>
          <div class='order_list_text'>${LText.information}</div>
        </div>
        <div class='order_list'>
          <div class='order_list_title'>${LText.customer}</div>
          <div class='customer_info'>
            <div class='info_li'>
              <div class='info_li_title'>${LText.payment}</div>
              <div class='info_li_text'>${LText.payReceipt}</div>
            </div>
            <div class='info_li'>
              <div class='info_li_title'>${LText.invoice}</div>
              <div class='info_li_text'>
                <p>${orderData.shipping_address.first_name}</p>
                <p>${orderData.shipping_address.phone}</p>
                <p>${orderData.shipping_address.country}</p>
                <p>${orderData.shipping_address.province}</p>
                <p>${orderData.shipping_address.city}</p>
                <p>${orderData.shipping_address.address1}</p>
                <p>${orderData.shipping_address.address2}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}())