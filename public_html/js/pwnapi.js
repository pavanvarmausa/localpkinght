function init() {
  registerEventHandlers();
}

function registerEventHandlers() {
  $(document)
      .on("click", "#searchPwnage", handleSearchFormSubmit)
      .on("submit", "#searchForm", handleDefaultFormBehavior);
}

function handleDefaultFormBehavior(e) {
  e.preventDefault();
  handleSearchFormSubmit();
}

function handleSearchFormSubmit(e) {
  
  var $loadingElement = $("#loading"),
      searchText = $("#Account").val();
  
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