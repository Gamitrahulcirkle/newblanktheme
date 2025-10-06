// ==================================================================================== Storefront filter START ===================================================================================================
function filterResults(event) {
    event.preventDefault();
    const section_id = $(this).closest('section').attr("section-id"), sortOption = $(".sort-by select").val();
    const params = new URLSearchParams();
    params.append("sort_by", sortOption);
    
    $(".shop__sidebar input:checked, .shop__sidebar input[type='range']").each(function () {
      params.append(this.name, this.value);
    });
    const url = `${window.location.pathname}?${params.toString()}`;
    
    $.get(`${url}&section_id=${section_id}`).done(function(data) {
      history.pushState(null, "", url);
      $.each(["products", "products-count"], function(index, key) {
        const selector = `[data-${key}-${section_id}]`;
        $(selector).html($(data).find(selector).html());
      });
      window.setBg();
      $(".shop__sidebar .size__list").each(function(i, ele) {
        $(ele).html($(data).find(".shop__sidebar .size__list").eq(i).html());
      });

    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("Request failed: " + textStatus + ", " + errorThrown);
    });
  }
  
  $("body").on("change", ".shop__sidebar input, .sort-by select", filterResults);
// ==================================================================================== Storefront filter END =====================================================================================================
