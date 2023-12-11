let totalPrice = '';
(function () {
  let xhr = new window.XMLHttpRequest();
  if (!window.XMLHttpRequest) {
    try {
      xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) { }
  }

  // 变体dom元素
  let variantRadios = document.getElementsByTagName('variant-radios')[0]
  if (variantRadios) {
    // 所有组合变体数据
    let variantData = JSON.parse(variantRadios.querySelector('[type="application/json"]').textContent);
    let currentSkuList = []
    let valueIdSortAndIndex = []
    let selectItemList = []
    let btnType = '1'
    if (variantData && variantData.length > 0) {
      variantData = variantData.filter(i => i.available)
      variantData.forEach(item => {
        item.selectedOptions = item.options.map(val => {
          return { value: val, propertyId: val }
        })
        // item.selectedOptions.forEach(val => {
        //   val.typeId = val.name
        //   val.propertyId = val.value
        // })
      })

      let valueIndex = [];
      let skuList = variantData.map((item, index) => {
        let valueIdSort = [];
        item.selectedOptions.map((skusTypesItem) => {
          valueIdSort.push(skusTypesItem.propertyId);
        });
        valueIndex.push({ valueIdSort: valueIdSort.sort() });
        return item.selectedOptions;
      });
      currentSkuList = skuList
      valueIdSortAndIndex = valueIndex
    }

    let moreSKUData = []
    let fieldset = variantRadios.getElementsByTagName('fieldset')
    let variantList = []
    let options = []
    if (fieldset && fieldset.length > 0) {
      Array.from(fieldset).forEach(item => {
        let obj = {
          name: item.getElementsByTagName('legend')[0].innerHTML,
          values: []
        }
        let label = item.getElementsByTagName('input')
        if (label && label.length > 0) {
          Array.from(label).forEach((val, ind) => {
            // obj.values.push({
            //   value: val.getAttribute("value"),
            //   active: ind == 0 ? true : false
            // })
            obj.values.push(val.getAttribute("value"))
          })
        }
        variantList.push(obj)
      })
    }

    // 重构变体数组
    let newmoresku = variantList.map(item => {
      item.id = item.name
      item.values = item.values.map(val => {
        let obj = {
          id: val,
          value: val,
          active: false,
          disabled: true,
        }
        return obj
      })
      return item
    })
    // 支持多件
    let firstSku = { list: newmoresku }
    options = JSON.parse(JSON.stringify(firstSku))
    initGoodType([firstSku], 0)
    // 默认选择变体
    // defaultSelection()
    // 创建变体选择器
    createVaruant()

    function defaultSelection() {
      console.log(newmoresku)
      // for (var i = 0; i < newmoresku.length; i++) {
      //   newmoresku[i].values.forEach((val, ind) => {
      //     handleClickSpecs1(fid, obj.id, obj, fkey, key, ffkey, moreSKUData)
      //   })
      //   // if (item.id == skuList[i].propertyId) {
      //   //   item.disabled = false;
      //   //   break;
      //   // }
      // }

      // let key = e.target.getAttribute("key")
      // let fkey = e.target.getAttribute("fkey")
      // let ffkey = e.target.getAttribute("ffkey")
      // let fid = e.target.getAttribute("fid")
      // let obj = moreSKUData[ffkey].list[fkey].values[key]
      // handleClickSpecs1(fid, obj.id, obj, fkey, key, ffkey, moreSKUData)
      handleClickSpecs1('"Color"', 'Khaki', {
        "id": "Khaki",
        "value": "Khaki",
        "active": false,
        "disabled": false
      }, 0, 0, 0, moreSKUData)
    }

    function handleClickSpecs1(grounpId, id, el, index, i, ind, moreSKU) {
      let newSelectItemList = selectItemList; // 已选规格
      if (el.disabled) {
        return;
      }
      // 处理selected的逻辑
      if (!el.active) {
        moreSKU[ind].list[index].values.forEach((item) => {
          item.active = false;
        });
        moreSKU[ind].list[index].values[i].active = true;
        // 选中项中有同组元素，替换
        newSelectItemList[ind].forEach((item, x_selected_index) => {
          if (item.index === index) {
            newSelectItemList[ind].splice(x_selected_index, 1);
          }
        });
        newSelectItemList[ind].push({ grounpId, id, index, i });
      } else {
        // 取消选中并删除选中项中数据
        moreSKU[ind].list[index].values[i].active = false;
        newSelectItemList[ind].forEach((item, x_selected_index) => {
          if (item.id === id && item.grounpId === grounpId) {
            newSelectItemList[ind].splice(x_selected_index, 1);
          }
        });
      }
      moreSKUData = [...moreSKU]
      selectItemList = newSelectItemList

      // // 取出组ID
      let x_selected_grounpIds = [];
      newSelectItemList[ind].forEach((item) => {
        x_selected_grounpIds.push(item.grounpId);
      });
      // 处理disabled的逻辑
      if (newSelectItemList[ind].length == 0) {
        // 选中属性为空，重新初始化数据
        initGoodType(moreSKU, ind)
      } else {
        //拿所有规格属性（即goodsTypeList）的每一项分别与已选中的数据（即selectItemList）的每一项，组成一个比较项，与现有库存比较，找到存在的可点项
        moreSKU[ind].list.forEach((goodsType, goodsTypeIndex) => {
          goodsType.values.forEach((prop, propIndex) => {
            if (!prop.active) {
              prop.disabled = true;
            }
            // 本次循环数据
            let push_data = {
              grounpId: goodsType.id,
              id: prop.id,
              index: goodsTypeIndex,
              i: propIndex,
            };
            if (x_selected_grounpIds.indexOf(goodsType.id) > -1) {
              // 当前循环的规格的组ID在已选规格中，删除同组规格，用当前规格替换后去与库存比较
              let sel = newSelectItemList[ind].slice(); // 用一个新变量接受数据，防止修改源数据
              let index_splice = x_selected_grounpIds.indexOf(goodsType.id);
              sel.splice(index_splice, 1, push_data);
              optionsHandle(sel, push_data, ind, moreSKU);
            } else {
              //  当前循环规格组ID不在已选规格中，添加当前规格到复制出来的已选数组中，循环比较
              let sel = newSelectItemList[ind].slice();
              sel.push(push_data);
              optionsHandle(sel, push_data, ind, moreSKU);
            }
          });
        });
        let copyOpt = moreSKU[ind].list
        let variantsList = variantData || []
        let filterOpt = copyOpt.map(item => {
          return {
            name: item.name,
            value: item.values.filter(i => i.active)[0]?.value
          }
        }).filter(i => i.value)
        if (filterOpt.length == copyOpt.length) {
          variantsList.forEach(varItem => {
            varItem._list = [];
            varItem.selectedOptions.forEach(item => {
              const _item = filterOpt.find(i => i.value == item.value);
              if (_item && _item.name == item.name) {
                varItem._list.push(_item)
              }
            })
          })
          console.log(filterOpt)
          console.log(variantsList)
          let selectOpt = variantsList.filter(i => i._list && i._list.length === filterOpt.length)[0]
          console.log(selectOpt)
          if (selectOpt) {
            moreSKU[ind].seleVariant = selectOpt
          }
        } else {
          moreSKU[ind].seleVariant = null
        }
        moreSKUData = [...moreSKU]
      }
      sumUp(moreSKU)
      createVaruant()
    }

    function initGoodType(moreSKU, ind) {
      let skuList = currentSkuList.flat(Infinity);
      moreSKU[ind].list.forEach((items) => {
        items.values.forEach((item) => {
          for (var i = 0; i < skuList.length; i++) {
            if (item.id == skuList[i].propertyId) {
              item.disabled = false;
              break;
            }
          }
        });
      });
      if (selectItemList.length != moreSKU.length) {
        moreSKU.forEach((item, index) => {
          if (!selectItemList[index]) {
            selectItemList[index] = []
          }
        })
      }
      moreSKUData = [...moreSKU]
    }

    function optionsHandle(selArr, push_data, ind, moreSKU) {
      let propertyIds = [];
      // 将当前比较项的属性ID提取
      selArr.map((item) => {
        propertyIds.push(item.id);
      });
      // 在现有库存中查找是否有可选项，可选的置为可点击
      valueIdSortAndIndex.map((item) => {
        if (isContained(item.valueIdSort, propertyIds)) {
          moreSKU[ind].list[push_data.index].values[
            push_data.i
          ].disabled = false;
        }
      });
      moreSKUData = [...moreSKU]
    }

    function isContained(aa, bb) {
      //判断aa数组是否 全 包含bb数组
      if (
        !(aa instanceof Array) ||
        !(bb instanceof Array) ||
        aa.length < bb.length
      ) {
        return false;
      }
      let aaStr = aa.toString();
      for (var i = 0; i < bb.length; i++) {
        if (aaStr.indexOf(bb[i]) < 0) {
          return false;
        }
      }
      return true;
    }

    function sumUp(moreSKU) {
      let priceObj = {
        price: 0,
        code: commonCurrency,
      }
      console.log(moreSKU)
      moreSKU.forEach(item => {
        priceObj.price = floatObjAdd(Number(item?.seleVariant?.price?.amount || 0), priceObj.price)
      })
      totalPrice = priceObj
    }

    // 生成变体选择器
    function createVaruant() {
      let variantBox = document.getElementsByClassName('variant_box')[0]
      // 清除现有的div元素  
      if (variantBox) {
        variantBox.remove()
      }
      let optionsDiv = document.createElement("div");
      optionsDiv.className = 'variant_box'
      optionsDiv.innerHTML = `
        <div key='1' class='buy_type_btn ${btnType == 1 ? ' active_btn' : ''}'>买一件</div>
        <div key='2' class='buy_type_btn ${btnType == 2 ? ' active_btn' : ''}'>买两件</div>
      `
      moreSKUData.map((specs, ind) => {
        optionsDiv.innerHTML += `<div class='variant_list' key=${ind}>
          <div class='variant_specs'>
            <span>#${ind + 1}</span>
            <span class='name'>${specs?.seleVariant?.title}</span>
            <span class='font_weight_b'>${specs?.seleVariant?.price.currencyCode} ${specs?.seleVariant?.price?.amount ? parseFloat(specs?.seleVariant?.price?.amount) : ''}</span>
          </div>
          <div class='variant_content'>
            ${specs.list
            .filter((option) => option.values.length > 1)
            .map((option, index1) => {
              return (`<div key=${option.name} class='variant_li'>
                  <div class='title'>${option.name}</div>
                  <div class='variant_li_sku'>${option.values.map((item, index) => {
                return (`<div
                      class=${item.active ? 'active_sku' : item.disabled ? 'disabled' : 'bord_sku'}
                      key=${index}
                      fkey=${index1}
                      ffkey=${ind}
                      fid=${option.id}
                    >${item.value}</div>`)
              }).join('')}</div>
                </div>`)
            }).join('')}
          </div>
        </div>`
      })
      variantRadios.insertAdjacentElement("afterend", optionsDiv);

      //变体按钮点击事件
      let bordSku = document.getElementsByClassName('bord_sku')
      Array.from(bordSku).forEach(item => {
        item.addEventListener('click', (e) => {
          let key = e.target.getAttribute("key")
          let fkey = e.target.getAttribute("fkey")
          let ffkey = e.target.getAttribute("ffkey")
          let fid = e.target.getAttribute("fid")
          let obj = moreSKUData[ffkey].list[fkey].values[key]
          handleClickSpecs1(fid, obj.id, obj, fkey, key, ffkey, moreSKUData)
        })
      })

      //优惠按钮点击事件
      let buyTypeBtn = document.getElementsByClassName('buy_type_btn')
      Array.from(buyTypeBtn).forEach(item => {
        item.addEventListener('click', (e) => {
          let key = e.target.getAttribute("key")
          btnType = key
          // 点击按钮买一件
          if (btnType == 1 && moreSKUData.length == 2) {
            let ind = moreSKUData.length - 1
            moreSKUData.splice(ind, 1);
            selectItemList[ind] = [];
            createVaruant()
            sumUp(moreSKUData)
          }
          // 点击按钮买两件
          if (btnType == 2 && moreSKUData.length == 1) {
            moreSKUData.push(JSON.parse(JSON.stringify(options)));
            initGoodType(moreSKUData, moreSKUData.length - 1);
            selectItemList[moreSKUData.length - 1] = [];
            createVaruant()
            sumUp(moreSKUData)
          }
        })
      })
      console.log(totalPrice)
    }
  }
}())