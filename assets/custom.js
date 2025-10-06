const replaceContent = (selectors, sectionId, html) => {
  $.each(selectors, (index, selector) => {
    const targetSelector = `[data-${selector}-${sectionId}]`;
    $(targetSelector).html($(html).find(targetSelector).html());
  });
}

const initOwlCarousel = ($carousel) => {
  if (!$carousel.hasClass('owl-loaded')) {
    $carousel.owlCarousel({
      items: 1,
      loop: false,
      margin: 10,
      nav: true,
      dots: false,
    });
  }
  $carousel.closest('.cart-drawer-upsell').addClass('loaded');
};


const productRecommendations = (element, initSlider = false) => {
  if ($(element).length > 0) {
    var productRecommendationsSection = $(element);
    var url = productRecommendationsSection.data("url");
    $.ajax({
      url: url,
      dataType: "html",
      success: function (data) {
        var htmlData = $(data);
        var recommendations = htmlData.find(element);

        if (recommendations.length && recommendations.html().trim().length) {
          productRecommendationsSection.html(recommendations.html());

          if ($("body").hasClass("template-product")) {
            window.setBg();
          }

          if (initSlider) {
            const $carousel = productRecommendationsSection.find('.recommended-items');
            initOwlCarousel($carousel);
          }
        }
        else{
          $(element).closest(".recommendation").remove();
        }
      },
      error: function (error) {
        console.log("error", error);
      },
    });
  } else if ($('.recommended-items').length) {
    initOwlCarousel($('.recommended-items'));
  }
}

const changeCartData = (section_id, element, open_cart_drawer = false) => {
  $.get("/cart?section_id=" + section_id + "&t=" + Math.random(), function (data) {
    $("[data-cart-item]").html($(data).find("[data-cart-item]").html());
    productRecommendations(element, open_cart_drawer);
  }
  );
}

const activeCartCount = () => {
  $.getJSON("/cart.js?t=" + Math.random(), function (cart) {
    $("#openCart").find(".tip").html(cart.item_count);
  });
}

const addToCart = (_this, formData, _this_text, section_id) => {
  $.ajax({
    type: "POST",
    url: routes.cart_add_url,
    data: formData,
    dataType: "json",
    error: function (xhr, ajaxOptions, thrownError) {
      alert(xhr.status);
    },
  }).done(function (data) {
    _this.find("span").html("Added");
    changeCartData(section_id, ".cart-recommendations", true);
    activeCartCount();
    setTimeout(function () {
      _this.removeAttr("disabled").find("span").html(_this_text);
      $("[data-cart-drawer]").addClass("active");
      $('.cart-overlay').addClass('active');
      $('body').css('overflow', 'hidden');
    }, 500);
  });
}

const changePrice = (price, compare_at_price, qty, selector, showDiscount) => {
  const formattedPrice = Shopify.formatMoney(price * qty, window.shop_money_format);
  selector.html(formattedPrice + (compare_at_price > price ? `<cp>${Shopify.formatMoney(compare_at_price * qty, window.shop_money_format)}</cp>` : ""));

  if ($('[data-savings-percentage]').length > 0 && showDiscount) {
    const text = $('[data-savings-percentage] .highlight').data('text'),
      percentage_off = Math.round(((compare_at_price - price) * 100) / compare_at_price),
      new_text = text.replace('{{ percantage }}', percentage_off) + '%';

    $('[data-savings-percentage] .highlight').html(new_text);
  }
}

$(document).ready(function () {
  
  productRecommendations(".product-recommendations", false);
  productRecommendations(".cart-recommendations", true);
  
  // =========================================================================================  Quick view START  ==================================================================================================
  $("body").on("click", ".quick-view-popup", function (e) {
    e.preventDefault();
    const $this = $(this);
    $($this).addClass("loading");
    $("#content_quickview").empty();
    const product_handle = $(this).data("product-handle"), mixer = $('.property__gallery').length > 0 ? mixitup('.property__gallery') : null;

    $.get("/products/" + product_handle + "/?section_id=quick-view")
      .done(function (data) {
        const html = new DOMParser().parseFromString(data, 'text/html');
        $("#content_quickview").append($(html).find(".modal-dialog"));

        // Pause MixItUp and show modal
        if (mixer) mixer.toggleOff();
        $('#content_quickview').modal('show');

        // Re-enable MixItUp after modal is closed
        $('#content_quickview').on('hidden.bs.modal', function () {
          if (mixer) mixer.toggleOn();
        });

        $($this).removeClass("loading");
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Request failed: " + textStatus + ", " + errorThrown);
      });
  });

  // ========================================================================================  Quick view START =====================================================================================================


  // ==================================================================================== Storefront filter START ===================================================================================================
  function filterResults(event) {
    event.preventDefault();
    const section_id = $(this).closest('section').attr("section-id"), sortOption = $(".sort-by select").val(), params = new URLSearchParams();
    params.append("sort_by", sortOption);

    $(".shop__sidebar input:checked, .shop__sidebar input[type='range']").each(function () {
      params.append(this.name, this.value);
    });
    const url = `${window.location.pathname}?${params.toString()}`;

    $.get(`${url}&section_id=${section_id}`).done(function (data) {
      // history.pushState(null, "", url);
      window.history.replaceState({}, '', url);
      replaceContent(["products", "products-count"], section_id, data);
      window.setBg();
      $(".shop__sidebar .size__list").each(function (i, ele) {
        $(ele).html($(data).find(".shop__sidebar .size__list").eq(i).html());
      });

    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Request failed: " + textStatus + ", " + errorThrown);
    });
  }

  $("body").on("change", ".shop__sidebar input, .sort-by select", filterResults);

  // ==================================================================================== Storefront filter END =====================================================================================================


  // ============================================================================================= Swatch START =======================================================================================================
  $("body").on("change", "variant-selects input", function () {
    const selectedSwatchValue = $(this).closest('.swatch').find('[data-selected-value]');
    if (selectedSwatchValue) $(selectedSwatchValue).html($(this).val());

    const sectionId = $(this).closest('variant-selects').data("section"), productUrl = $(this).data("product-url"), changeURL = $(this).closest('variant-selects').data("change-url");;
    const optionValues = $(this).closest("variant-selects").find('fieldset input:checked').map(function () {
      return $(this).data("option-value-id");
    }).get().join(',');

    const requestUrl = `${productUrl}?section_id=${sectionId}&option_values=${optionValues}`;
    renderProductInfo(requestUrl, productUrl, sectionId, changeURL)

  });

  const renderProductInfo = async (requestUrl, productUrl, sectionId, changeURL) => {
    try {
      const response = await fetch(requestUrl);
      const responseText = await response.text();
      const html = new DOMParser().parseFromString(responseText, 'text/html');
  
      const variantData = $(html).find('variant-selects [data-selected-variant]').text();
      const variant = variantData ? JSON.parse(variantData) : null;
  
      if (changeURL) {
        const newUrl = `${productUrl}${variant ? `?variant=${variant.id}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      }
  
      replaceContent(["product-media", "price", "stock-info", "product-form"], sectionId, html);
      await initOwlCarousel($(".product__details__pic__slider")); // Now works properly with await
      
       // const f_id = variant.featured_media.id, imageElement = $('img[data-img="' + f_id + '"]'), thumbImage = $('a[data-img="' + f_id + '"]'),
      //   owlCarousel = $('.product__details__pic__slider').owlCarousel();
      // if (imageElement.length > 0 && thumbImage.length > 0) {
      //   const slideIndex = owlCarousel.find('.owl-item').index($(imageElement).closest('.owl-item'));
      //   owlCarousel.trigger('to.owl.carousel', [slideIndex, 250]);
      //   thumbImage.get(0)?.scrollIntoView({
      //     behavior: 'smooth',
      //     block: 'center',
      //     inline: 'nearest'
      //   });
      // }
      
    } catch (error) {
      console.error("Error in renderProductInfo:", error);
    }
  };


  // ============================================================================================= Swatch END =======================================================================================================


  // ============================================================================================ ADD TO CART START ==================================================================================================
  $("body").on("click", "[data-add-to-cart]", function (e) {
    e.preventDefault();
    var _this = $(this), _this_text = _this.find("span").html(),
      form = $(this).closest("form"),
      formData = form.serializeArray(),
      section_id = _this.data("section-id");
    _this.attr("disabled", "disabled").find("span").html(window.variantStrings.adding);

    // ADD SELECTED SELLING PLAN
    if (form.data('form') == 'product-page') {
      if (_this.parents().find('[data-radio-type="selling_plan"]').length > 0 && _this.parents().find('[data-radio-type="selling_plan"]').is(':checked')) {
        formData.push({ name: "selling_plan", value: _this.parents().find('[name="product-selling_plan"]').val() });
      }
    }
    // ADD SELECTED SELLING PLAN
    addToCart(_this, formData, _this_text, section_id);
  });
  // ============================================================================================ ADD TO CART END ==================================================================================================

  // ============================================================================================ SUBSCRIBE START ==================================================================================================

  // PRODUCT PAGE
  $('body').on('change', '[name="product-selling_plan"]', function (e) {
    e.preventDefault();
    $(this).parents('[data-sub-plan]').find('.subscribe-check-input').trigger('click');

    const $parent = $(this).parents('[data-product-info]'),
      qty = parseInt($parent.find('input[name="quantity"]:checked').val() || 1),
      plan_interval = $(this).find(':selected').data('selling-plan-name'),
      price = $(this).find(':selected').data('variant-price'),
      compare_at_price = $(this).find(':selected').data('variant-compare-at-price'),
      $priceSelector = $(this).parents('[data-sub-plan]').find('[data-plan-price]');
    // $(this).parents('[data-sub-plan]').find('[data-plan-name]').html(plan_interval);

    changePrice(price, compare_at_price, qty, $priceSelector, true);

  });

  // cart select 
  $("body").on('change', '[name="update_selling_plan"]', function (e) {
    e.preventDefault();
    $(".error-message").remove();

    var $parent = $(this).parents('[data-item-list]'),
      key = $parent.find('[name="updates[]"]').data("id"),
      qty = $parent.find('[name="updates[]"]').val(),
      section_id = $parent.find('[name="updates[]"]').data("section-id"),
      itemData = "quantity=" + parseInt(qty) + "&line=" + parseInt(key) + '&selling_plan=' + $(this).val();

    $(this).parent().find("button, select").attr("disabled", "disabled");
    updateCart($(this), $parent, itemData, section_id);
  });

  // Cart Subscribe & Save Up
  $("body").on('click', '.upgrade_selling_plan', function (e) {
    e.preventDefault();
    $(".error-message").remove();

    var $parent = $(this).parents('[data-item-list]'),
      key = $parent.find('[name="updates[]"]').data("id"),
      qty = $parent.find('[name="updates[]"]').val(),
      section_id = $parent.find('[name="updates[]"]').data("section-id"),
      itemData = "quantity=" + parseInt(qty) + "&line=" + parseInt(key) + '&selling_plan=' + $(this).data('subscription-id');

    $(this).parent().find("button, select").attr("disabled", "disabled");
    updateCart($(this), $parent, itemData, section_id);
  });


  // ============================================================================================ SUBSCRIBE END ==================================================================================================


  function updateCart(_this, $parent, itemData, section_id) {
    $(".error-message").remove();
    $.ajax({
      type: "POST",
      url: window.routes.cart_change_url,
      dataType: "json",
      data: itemData,
      success: function (data) {
        changeCartData(section_id, ".cart-recommendations", true);
        activeCartCount();

        setTimeout(function () {
          $parent.find("button, select").removeAttr("disabled");
        }, 2000);
      },
      error: function (response) {
        $parent.find(".cart-list-qty")
          .append(
            '<p class="error-message">' + response.responseJSON.errors + "</p>"
          );

        setTimeout(function () {
          $(".error").remove();
          $parent.find("button, select").removeAttr("disabled");
        }, 5000);
      },
    });
  }

  $("body").on("click", "[data-item-list] .qtyBtn", function (e) {
    $(".error-message").remove();
    var _this = $(this),
      $parent = $(this).parents('[data-item-list]'),
      error = "",
      input = $(this).parent().find("input"),
      min = input.data("min"),
      max = input.attr("max"),
      step = input.attr("step"),
      section_id = input.data("section-id"),
      input_val = parseInt(input.val());

    $parent.find("button, select").attr("disabled", "disabled");
    error =
      input_val < min
        ? `This item has a minimum of ${min}`
        : input_val > parseInt(max)
          ? `This item has a maximum of ${max}`
          : input_val % parseInt(step) !== 0
            ? `You can only add this item in increments of ${step}`
            : "";
    
    $(this)
      .parents("[data-item-list]")
      .find(".cart-list-qty")
      .append('<p class="error">' + error + "</p>");

    var key = $parent.find('[name="updates[]"]').data("id"),
      itemData = "quantity=" + input_val + "&line=" + parseInt(key);
    updateCart($(this), $parent, itemData, section_id);
  });


  $("body").on("click", "[data-cart-delete]", function (e) {
    e.preventDefault();

    var $parent = $(this).parents('[data-item-list]'),
      key = $parent.find('[name="updates[]"]').data("id"),
      section_id = $parent.find('[name="updates[]"]').data("section-id"),
      itemData = "quantity=0&line=" + parseInt(key);

    $parent.find("button, select").attr("disabled", "disabled");
    updateCart($(this), $parent, itemData, section_id);
  });

});
