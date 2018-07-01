function init() {
  registerEventHandlers();
}

function registerEventHandlers() {
  $(document)
      .on("click", "#searchPwnage", handleSearchFormSubmit)
      .on("keypress", "#searchForm input.active", handleFormInputKeyPress)
      .on("click", "#header_nav .main-nav a", handleMenuItemsClick);
}

function handleFormInputKeyPress(event) {
  if(event.key == "Enter") {
    handleSearchFormSubmit();
  }
}

function handleSearchFormSubmit(e) {
  
  var $loadingElement = $("#loading");
  var selectedMenuItem = $("#header_nav a.selected-link").attr("data-type");
  var searchText = "";

  if ( selectedMenuItem == "domains") {
    searchText = $("#domains-search").val();
  } else if ( selectedMenuItem == "passwords" ) {
    searchText = $("#password-search").val();
    validatePassword($loadingElement, searchText);
  } else {
    searchText = $("#email-search").val();
    validateEmailAddress($loadingElement, searchText);
  }
}

function validatePassword($loadingElement, searchText) {
  $loadingElement.show();
  $("#noPwnage_passwords, #invalidPasswords").hide();

  if(!searchText) {
    alert("Enter a Valid Value");
    $loadingElement.hide();
    return;
  }

  $.ajax({
    method: "GET",
    url: "http://passwordknightrest.azurewebsites.net/api/passwords/" + searchText
  })
  .done(function( data ) {
      $loadingElement.hide();
      console.log(data);
      if(data == "Exists") {
        $("#invalidPasswords").show();
      } else {
        $("#noPwnage_passwords").show();
      }
  })
  .fail(function(error){
    $loadingElement.hide();
    $("#noPwnage_passwords").show();
    return;
  });
}

function validateEmailAddress($loadingElement, searchText) {
  $loadingElement.show();
  $("#noPwnage, #invalidAccount").hide();

  if(!searchText) {
    alert("Enter a Valid Value");
    $loadingElement.hide();
    return;
  }

  $.ajax({
    method: "GET",
    url: "http://passwordknightrest.azurewebsites.net/api/values/" + searchText
  })
  .done(function( data ) {
      console.log(data.length);
      $loadingElement.hide();
      console.log(data);
      if(data.length > 0) {
        $("#invalidAccount").show();
        renderPwnedContent(data);
      } else {
        $("#noPwnage").show();
      }
  })
  .fail(function(error){
    $loadingElement.hide();
    $("#noPwnage").show();
    return;
  });
}

function handleMenuItemsClick(e) {
  e.preventDefault();
  var $el = $(this);
  var eleType = $el.attr("data-type");

  $(".search-results-container, #searchContainer .form-control").removeClass("show active").addClass("hide");
  $("#header_nav a").removeClass("selected-link");

  $el.addClass("selected-link");

  if ( eleType == "domains") {
    $("#domains_serach_results_container, #searchContainer #domains-search").removeClass("hide").addClass("show active");
  } else if ( eleType == "passwords" ) {
    $("#passwords_serach_results_container, #searchContainer #password-search").removeClass("hide").addClass("show active");
  } else {
    $("#emails_serach_results_container, #searchContainer #email-search").removeClass("hide").addClass("show active");
  }
}

function renderPwnedContent(data) {
  var $pwnedContentEle = $("#pwnedContent");
  var $pwnedHtml = "";
  data = JSON.parse(data);
  $.each(data, function(index, pwnedSiteobj){
    var compromisedNamesHtml = "<strong class='text-white'>Compromised Data:</strong> ";
    var dataClasseslength = pwnedSiteobj.DataClasses.length;

    $.each(pwnedSiteobj.DataClasses, function(j, dataClass) {
      compromisedNamesHtml += dataClass;
      (j == (dataClasseslength-1) ) ? compromisedNamesHtml += "." : compromisedNamesHtml += ", ";
    });

    $pwnedHtml += '<div class="row website"><div class="col-12 col-sm-12 col-md-12 col-lg-2 col-xl-2 img-container"><a href="#"><img id="companyLogo-'+index+'" src="img/noimage.png" alt="No Image"></a></div><div class="col-12 col-sm-12 col-md-12 col-lg-10 col-xl-10 website-description"><p class="text-white text-left"><strong class="text-white">'+ pwnedSiteobj.Name +': </strong>'+ pwnedSiteobj.Description +'</p><p id="compromisedName-'+index+'" class="text-left text-white compromised-names">'+compromisedNamesHtml+'</p></div></div>';
  });

  $pwnedContentEle.empty();
  $pwnedContentEle.append($pwnedHtml);

  lazyLoadImages(data);
}

function lazyLoadImages(data){
  $.each(data, function(index, pwnedSiteobj) {
    $("#companyLogo-"+index).attr("src", 'https://logo.clearbit.com/' + pwnedSiteobj.Domain);   
    $("#companyLogo-"+index).error(function() {
      $("#companyLogo-"+index).attr("src", "img/noimage.png");
      $("#companyLogo-"+index).parent().addClass("errorImage");
    });
  });
}

$(function(){
  init();
});