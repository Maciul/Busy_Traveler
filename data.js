$(document).ready(function() {
var countryTo = {};
var countryFrom = {};

$.get('https://restcountries.eu/rest/v1/all', function(countryList) {
  countryList.forEach(function(item, index) {
    $('select').append('<option value='+item.alpha2Code+'>'+ item.name + '</option>');
  });
  $('#travelFrom option[value="US"]').insertBefore('#travelFrom option[value="AF"]');
  $('main').hide();
});

//Button clicked - values extracted (2 letter country codes)
$('button').click(function(event) {
  event.preventDefault();
  $('#loading').show();
  specific = $('select.to option:selected').val();
  specific2 = $('select.from option:selected').val();

// Empty elements once new click happens
  $('.comparison').empty();
  $('.exchange').empty();
  $('.general').empty();
  $('.pictures').empty();
  $('.safety').empty();

// Getting values for calling different API's //
$.when( $.ajax( 'https://restcountries.eu/rest/v1/alpha?codes='+specific+';'+specific2+'' ),
        $.ajax('https://knoema.com/api/1.0/meta/dataset/ICPR2011/dimension/region' ) ).done(function(data, region) {

// A2 CODE and CURRENCY //
  countryTo.A2 = data[0][0].alpha2Code;
  countryTo.currency = data[0][0].currencies[0];
  countryTo.country = data[0][0].name;
  countryFrom.A2 = data[0][1].alpha2Code;
  countryFrom.currency = data[0][1].currencies[0];

// 7 DIGIT CODE code based on specific countries picked //
 region[0].items.forEach(function(item, index) {
  if (item.fields.regionid === specific) {
    countryTo.id = item.key;
  }
  if (item.fields.regionid === specific2) {
    countryFrom.id = item.key;
  }
});

// CURRENCY CALCULATOR - With if statements to prevent undefined -----
$.get('https://api.fixer.io/latest?base='+countryFrom.currency+'&symbols='+countryTo.currency+'').done(function(currency) {
  var exchange = $('.exchange');

  exchange.append('<div class="rate"></div>');
  exchange.append('<div class="tip"><p>Tip of the day: Use Credit and ATM Cards:You will \
  almost always get the best interbank exchange rate when buying foreign currency \
  with either ATM cards or credit cards, which will usually be 2 to 7 percent better \
  than the rates you will get when exchanging cash or travelers checks. Try to use credit \
   cards whenever possible for large purchases such as hotel bills, tickets and car rentals.</p></div>');
  var rate = $('.rate');

  if (countryFrom.currency === countryTo.currency) {
    exchange.prepend('<div><img class="big-icon" src=images/exchange.svg></div>');
    rate.append('<h3>Both countries have the same currency! No need to exchange!!!</h3>');
  } else if (currency.rates[countryTo.currency] === undefined){
    exchange.prepend('<div><img class="big-icon" src=images/exchange.svg></div>');
    rate.append('<h3>Sorry, we do not have information about this specific exchange you can find all exchange rates <a href="http://www.xe.com/currencyconverter/">HERE</a></h3>');
  } else {
    exchange.prepend('<div><img class="big-icon" src=images/exchange.svg></div>');
    rate.append('<h3>1 '+countryFrom.currency+' will get you ' +currency.rates[countryTo.currency]+' '+countryTo.currency+'<h3>');
  }
}).fail(function(error) {
  $('.exchange').prepend('<div><img class="big-icon" src=images/exchange.svg></div>');
  $('.exchange').append('<div class="rate"><h3>Relax, you did not brake the converter...\
   We just do not have this data currently. You can go <a href="http://www.xe.com/currencyconverter/">HERE</a></h3></div> ');
});

// FINANCIAL Purchasing power parity stats -- will display as $100 is worth x amount??
$.get('https://knoema.com/api/1.0/data/ICPR2011?Time=2011-2011&region='+
countryFrom.id+','+countryTo.id+'&measures-components=1000270,1000260,1000360&economic-aggregates=1000190&Frequencies=A', function(financial) {

  var PPP = financial.data; //Purchasing Power Parity //

  if (PPP.length < 6) {

    $('.comparison').append('<div><img class="big-icon" src="images/human.svg"></div>');
    $('.comparison').append('<div class="money"></div>');
    $('.money').append('<h4> Exchange rates are cool but based on some crazy\
     data collecting and intense algorithms we can tell you how much 100\
     '+countryFrom.currency+' will be worth in '+countryTo.country+'</h4>');
    $('.comparison').append('<div><h4>OR NOT.... unfortunately received\
     insufficient data from WORLD BANK to make this happen!!!</h4></div>');
  } else {

    var alcohol = Math.round(100 / (1 - ((PPP[0].Value - PPP[3].Value) / PPP[0].Value)));
    var food =    Math.round(100 / (1 - ((PPP[1].Value - PPP[4].Value) / PPP[1].Value)));
    var hotels =  Math.round(100 / (1 - ((PPP[2].Value - PPP[5].Value) / PPP[2].Value)));

    $('.comparison').append('<div><img class="big-icon" src="images/human.svg"></div>');
    $('.comparison').append('<div class="money"></div>');
    $('.comparison').append('<div class="alcohol"></div>');
    $('.comparison').append('<div class="food"></div>');
    $('.comparison').append('<div class="hotels"></div>');
    $('.money').append('<h3> Exchange rates are cool but based on some crazy data collecting and intense algorithms we can tell you how much 100'+countryFrom.currency+' will be worth in '+countryTo.country+'</h3>');
    $('.alcohol').append('<h2>100 '+countryFrom.currency+'</h2>');
    $('.alcohol').append('<img class="icon" src="images/drink.svg" alt="capital">');
    $('.alcohol').append('<h2>' +alcohol+' ' +countryFrom.currency+ '</h2>');
    $('.food').append('<h2>100 '+countryFrom.currency+'</h2>');
    $('.food').append('<img class="icon" src="images/food.svg" alt="capital">');
    $('.food').append('<h2>' +food+' ' +countryFrom.currency+ '</h2>');
    $('.hotels').append('<h2>100 '+countryFrom.currency+'</h2>');
    $('.hotels').append('<img class="icon" src="images/hotel.svg" alt="capital">');
    $('.hotels').append('<h2>' +hotels+ ' ' +countryFrom.currency+'</h2>');
  }
});

//GENERAL COUNTRY INFORMATION - country name - official name - capital - subregion
$.get('https://restcountries.eu/rest/v1/alpha/'+countryTo.A2, function(general) {

  var lastElement = general.altSpellings.length - 1;
  $('.general').append('<div class="gMain"></div>');
  $('.gMain').append('<img class="icon" src="images/location.svg" alt="locator">');
  $('.gMain').append('<h1>'+general.name+'</h1>');
  $('.general').append('<div class="gOfficial"></div>');
  $('.gOfficial').append('<h2>'+general.altSpellings[lastElement]+'</h2>');
  $('.general').append('<div class="gExtra"></div>');
  $('.gExtra').append('<div><h2>'+general.subregion+'</h2><img class="icon" src="images/continent.svg" alt="continent"><h3>Region</h3></div>');
  $('.gExtra').append('<div><h2>'+general.capital+'</h2><img class="icon" src="images/star.svg" alt="star"><h3>Capital City</h3></div>');
  $('.gExtra').append('<div><h2>'+general.currencies[0]+'</h2><img class="icon" src="images/coins.svg" alt="currency"><h3>Currency</h3></div>');
});


// SAFETY INFORMATION - checking general travel advisory and regional advisory (Canadian Source)
var tuGroup = {
"url": "https://api.tugroup.com/v1/travelsafe/countries/"+countryTo.A2,
"method": "GET",
"headers": {
  "x-auth-api-key": "um59hvs6gx8z674reuqmtzna",
  }
};
$.ajax(tuGroup).done(function (safety) {
  var regional = safety.advisories.regionalAdvisories;

// Turn off Loading and Display Main
  $('#loading').hide();
  $('main').show();
  $('html, body').animate({
        scrollTop: $("#general").offset().top
    }, 2000);

  $('.safety').append('<div class="sAdvisory"></div>');
  $('.sAdvisory').append('<h2> Safety Advisory</h2>');
  $('.sAdvisory').append('<p>'+safety.advisories.description+'</p>');
  $('.safety').append('<div></div>');

// Red or Green safety advisory icon
  if (safety.advisoryState > 0) {
    $('.safety').prepend('<div><img class="big-icon" src="images/warningRed.svg"</div>');
  } else if (safety.advisoryState === 0) {
    $('.safety').prepend('<div><img class="big-icon" src="images/warningGreen.svg"</div>');
  }
  regional.forEach(function(item, index){
    $('.sAdvisory').append('<h3>' +item.category+ '</h3>');
    $('.sAdvisory').append('<p>' +item.description+ '</p>');
  });
  }).fail(function(error) {
    $('.safety').append('<div><img class="big-icon" src="images/safety.svg"></div>');
    $('.safety').append('<h3> No travel advisory data avaialable for '+countryTo.name+'</h3>');
    $('#loading').hide();
    $('main').show();
  });

//PICTURES SECTION - FlickrAPI - Requesting pictures based on keyword relevancy
$.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6046bd3b0b0209c90dcfb95e499d4248&text='+countryTo.country+'%2C+architecture%2C+landscape&sort=relevance&accuracy=3&format=json&nojsoncallback=1', function(result){
  var pics = result.photos.photo;

  $('.pictures').append('<div><img class="big-icon" src="images/camera.svg" alt="camera">');
  $('.pictures').append('<div class=pics></div>');
  $('.pics').append('<img src=https://farm'+pics[0].farm+'.staticflickr.com/'+pics[0].server+'/'+pics[0].id+'_'+pics[0].secret+'.jpg</img>');
  $('.pics').append('<img src=https://farm'+pics[10].farm+'.staticflickr.com/'+pics[10].server+'/'+pics[10].id+'_'+pics[10].secret+'.jpg</img>');
  $('.pics').append('<img src=https://farm'+pics[20].farm+'.staticflickr.com/'+pics[20].server+'/'+pics[20].id+'_'+pics[20].secret+'.jpg</img>');
});
});
});
});
