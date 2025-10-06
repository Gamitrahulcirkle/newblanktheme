/*  ---------------------------------------------------
Template Name: Ashion
Description: Ashion ecommerce template
Author: Colorib
Author URI: https://colorlib.com/
Version: 1.0
Created: Colorib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Product filter
        --------------------*/
         const mixer = $('.property__gallery').length > 0 ? mixitup('.property__gallery') : null;

        // Filter control active state toggle
        $('.filter__controls li').on('click', function () {
            $(this).addClass('active').siblings().removeClass('active');
        });
    
        // Quick view popup modal handler
        // $('.quick-view-popup').on('click', function(e) {
        //     e.preventDefault();
    
        //     // Pause MixItUp and show modal
        //     if (mixer) mixer.toggleOff();
        //     $('#content_quickview').modal('show');
    
        //     // Re-enable MixItUp after modal is closed
        //     $('#content_quickview').on('hidden.bs.modal', function () {
        //         if (mixer) mixer.toggleOn();
        //     });
        // });
    });

    /*------------------
        Background Set
    --------------------*/
    window.setBg = function() {
      $('.set-bg').each(function () {
          var bg = $(this).data('setbg');
          $(this).css('background-image', 'url(' + bg + ')');
      });
    }
     window.setBg();

    //Search Switch
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    //Canvas Menu
    $(".canvas__open").on('click', function () {
        $(".offcanvas-menu-wrapper").addClass("active");
        $(".offcanvas-menu-overlay").addClass("active");
    });

    $(".offcanvas-menu-overlay, .offcanvas__close").on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("active");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".header__menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Accordin Active
    --------------------*/
    $('.collapse').on('shown.bs.collapse', function () {
        $(this).prev().addClass('active');
    });

    $('.collapse').on('hidden.bs.collapse', function () {
        $(this).prev().removeClass('active');
    });

    /*--------------------------
        Banner Slider
    ----------------------------*/
    $(".banner__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });

    /*--------------------------
        Product Details Slider
    ----------------------------*/

    var $owl = $(".product__details__pic__slider");
    var $thumbs = $(".product__thumb a");
  
    // Initialize Owl Carousel
    var owl = $owl.owlCarousel({
      loop: false,
      margin: 0,
      items: 1,
      dots: false,
      nav: true,
      navText: [
        "<i class='arrow_carrot-left'></i>",
        "<i class='arrow_carrot-right'></i>"
      ],
      smartSpeed: 1200,
      autoHeight: false,
      autoplay: false,
      mouseDrag: false,
      startPosition: 0 
    }).on("changed.owl.carousel", function(event) {
      var indexNum = event.item.index + 1;
      setActiveThumbnail(indexNum); 
    });
  
    // Function to update active state of thumbnails
    function setActiveThumbnail(num) {
      $thumbs.removeClass("active"); // Remove active class from all thumbnails
      // If thumbnail's data-target matches the carousel index, add active class
      $thumbs.filter("[data-target='" + num + "']").addClass("active");
    }
  
    // Thumbnail click event to synchronize carousel
    $thumbs.on("click", function(e) {
      e.preventDefault(); // Prevent default anchor behavior (URL change)
  
      var index = $(this).data("target") - 1; // Convert to 0-based index
      owl.trigger("to.owl.carousel", [index, 250]); // Move the carousel to the corresponding slide
  
      setActiveThumbnail(index + 1); // Passing the 1-based index
    });
  
    // Optionally, set the first thumbnail as active on page load
    $thumbs.first().addClass("active");


    /*------------------
		Magnific
    --------------------*/
    // $('.image-popup').magnificPopup({
    //     type: 'image'
    // });


    $(".nice-scroll").niceScroll({
        cursorborder:"",
        cursorcolor:"#dddddd",
        boxzoom:false,
        cursorwidth: 5,
        background: 'rgba(0, 0, 0, 0.2)',
        cursorborderradius:50,
        horizrailenabled: false
    });

    const $target = $('.product__thumb');

    function toggleClassByWidth() {
      const isMobile = $(window).width() <= 767;
      $target.toggleClass('nice-scroll', !isMobile);
    }

    toggleClassByWidth();
    $(window).on('resize', toggleClassByWidth);

    /*------------------
        CountDown
    --------------------*/
    // For demo preview start
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    if(mm == 12) {
        mm = '01';
        yyyy = yyyy + 1;
    } else {
        mm = parseInt(mm) + 1;
        mm = String(mm).padStart(2, '0');
    }
    var timerdate = mm + '/' + dd + '/' + yyyy;
    // For demo preview end


    // Uncomment below and use your date //

    /* var timerdate = "2020/12/30" */

    if ($("body").hasClass("template-collection")) {
      $("#countdown-time").countdown(timerdate, function(event) {
        $(this).html(event.strftime("<div class='countdown__item'><span>%D</span> <p>Day</p> </div>" + "<div class='countdown__item'><span>%H</span> <p>Hour</p> </div>" + "<div class='countdown__item'><span>%M</span> <p>Min</p> </div>" + "<div class='countdown__item'><span>%S</span> <p>Sec</p> </div>"));
      });
    }

    /*-------------------
		Range Slider
	--------------------- */
      function updateSliderTrack(minVal, maxVal, range, minRange, maxRange) {
        range.style.left = (minVal / minRange.max) * 100 + "%";
        range.style.right = 100 - (maxVal / maxRange.max) * 100 + "%";
      }
  
      window.priceRangeFilter = function() {
        
      const rangeInput = document.querySelectorAll(".range-input input"),
            minPriceDisplay = document.querySelector(".min-price-display"),
            maxPriceDisplay = document.querySelector(".max-price-display"),
            range = document.querySelector(".input-slider .input-progress"),
            minRange = rangeInput[0],
            maxRange = rangeInput[1];
        
        if (minPriceDisplay && rangeInput) {
          let priceGap = 10;
          var minVal = parseInt(minRange.value),
              maxVal = parseInt(maxRange.value);
        
          range.style.left = (minVal / minRange.max) * 100 + "%";
          range.style.right = 100 - (maxVal / maxRange.max) * 100 + "%";
        
          minRange.addEventListener("input", (e) => {
            var minVal = parseInt(minRange.value),
              maxVal = parseInt(maxRange.value);
        
            if (parseInt(minRange.value) > parseInt(maxRange.value)) {
              minRange.value = maxRange.value;
            }
            minPriceDisplay.textContent = minRange.value;
            updateSliderTrack(minVal, maxVal, range, minRange, maxRange);
          });
        
          maxRange.addEventListener("input", () => {
            var minVal = parseInt(minRange.value),
              maxVal = parseInt(maxRange.value);
            if (parseInt(maxRange.value) < parseInt(minRange.value)) {
              maxRange.value = minRange.value;
            }
            maxPriceDisplay.textContent = maxRange.value;
            updateSliderTrack(minVal, maxVal, range, minRange, maxRange);
          });
        }
      }

      window.priceRangeFilter();

    /*------------------
		Single Product
	--------------------*/
	$('.product__thumb .pt').on('click', function(){
		var imgurl = $(this).data('imgbigurl');
		var bigImg = $('.product__big__img').attr('src');
		if(imgurl != bigImg) {
			$('.product__big__img').attr({src: imgurl});
		}
    });
    
    /*-------------------
		Quantity change
	--------------------- */
    $('body').on('click', '.qtyBtn', function () {
        const $button = $(this);
        const $input = $button.siblings('input');
        const oldValue = parseFloat($input.val()) || 1;
        let newVal = oldValue;
    
        if ($button.hasClass('plus')) {
            newVal = oldValue + 1;
        } else if ($button.hasClass('minus')) {
            newVal = Math.max(1, oldValue - 1); 
        }
    
        $input.val(newVal).trigger('change');
    });

  
    // Open cart
    $('#openCart').click(function() {
      $('.cart-drawer').addClass('active');
      $('.cart-overlay').addClass('active');
      $('body').css('overflow', 'hidden');
    });
  
    // Close cart
    $('#closeCart, .cart-overlay').click(function() {
      $('.cart-drawer').removeClass('active');
      $('.cart-overlay').removeClass('active');
      $('body').css('overflow', 'auto');
    });

})(jQuery);