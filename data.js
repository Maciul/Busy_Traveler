$(document).ready(function() {
var countryTo = {}
var countryFrom = {}

$.get('https://restcountries.eu/rest/v1/all', function(countryList) {
  countryList.forEach(function(item, index) {
    $('select').append('<option value='+item.alpha2Code+'>'+ item.name + '</option>')
  })
})
//Button clicked - values extracted (2 letter country codes)
$('button').click(function(event) {
  event.preventDefault()
  specific = $('select.to option:selected').val()
  specific2 = $('select.from option:selected').val()
// Empty elements once new click happens
  $('.comparison h2').empty()
  $('.alcohol').empty()
  $('.exchange').empty()
  $('.general div').empty()
  $('.pics').empty()
  $('.pictures h2').empty()
  $('.safety').empty()
// Getting values for calling different API's //
$.when( $.ajax( 'https://restcountries.eu/rest/v1/alpha?codes='+specific+';'+specific2+'' ),
        $.ajax('https://knoema.com/api/1.0/meta/dataset/ICPR2011/dimension/region' ) ).done(function(data, region) {
// Get the country a2 code and currency //

  countryTo.A2 = data[0][0].alpha2Code;
  countryTo.currency = data[0][0].currencies[0];
  countryTo.country = data[0][0].name
  countryFrom.A2 = data[0][1].alpha2Code;
  countryFrom.currency = data[0][1].currencies[0];

// Get the 7-digit code based on specific countries picked //
   region[0].items.forEach(function(item, index) {
    if (item.fields.regionid === specific) {
      countryTo.id = item.key;
    }
    if (item.fields.regionid === specific2) {
      countryFrom.id = item.key;
    }
  })

// CURRENCY CALCULATOR - With if statements to prevent undefined -----
  $.get('https://api.fixer.io/latest?base='+countryFrom.currency+'&symbols='+countryTo.currency+'').done(function(currency) {
    if (countryFrom.currency === countryTo.currency) {
      $('.exchange').append("Both countries have the same currency! No need to exchange!!!")
    } else if (currency.rates[countryTo.currency] === undefined){
      $('.exchange').append('Sorry, no information on that exchange rate check out:')
    }else {
      $('.exchange').append('1 '+countryFrom.currency+' gets you a whooping ' +currency.rates[countryTo.currency]+' '+countryTo.currency)
    }
  }).fail(function(error) {
    $('.exchange').append('<h2> Currency Exchange Rate</h2>')
    $('.exchange').append('Relax, you did not brake the converter... We just do not have this data currently.')
})
// FINANCIAL Purchasing power parity stats -- will display as $100 is worth x amount??
  $.get('https://knoema.com/api/1.0/data/ICPR2011?Time=2011-2011&region='
  +countryFrom.id+','+countryTo.id+'&measures-components=1000270,1000260,1000360&economic-aggregates=1000190&Frequencies=A', function(financial) {
      PPP = financial.data //Purchasing Power Parity //
      if (PPP.length < 6) {
        $('.comparison').append('<h2>What is 100 '+countryFrom.currency+' worth in '+countryTo.country+'</h2>')
        $('.comparison').append('<p>Insufficient data from WORLD BANK - Sorry!!!</p>')
      } else {
      var alcohol = Math.round(100 / (1 - ((PPP[0].Value - PPP[3].Value) / PPP[0].Value)))
      var food = Math.round(100 / (1 - ((PPP[1].Value - PPP[4].Value) / PPP[1].Value)));
      var restaurant = Math.round(100 / (1 - ((PPP[2].Value - PPP[5].Value) / PPP[2].Value)));
      $('.comparison').prepend('<h2>What is 100 '+countryFrom.currency+' truly worth in '+countryTo.country+'?</h2>')
      $('.alcohol').append('<div><h2>100</h2></div>')
      $('.alcohol').append('<div><img src="images/star.svg" alt="capital"></div>')
      $('.alcohol').append('<div><h2>' +alcohol+ '</h2></div>')
      $('.food').append('<div><h2>100</h2></div>')
      $('.food').append('<div><img src="images/star.svg" alt="capital"></div>')
      $('.food').append('<div><h2>' +food+ '</h2></div>')
      $('.hotels').append('<div><h2>100</h2></div>')
      $('.hotels').append('<div><img src="images/star.svg" alt="capital"></div>')
      $('.hotels').append('<div><h2>' +restaurant+ '</h2></div>')
      // $('.comparison').append('<h2>'+alcohol+ '</h2>')
      // $('.comparison').append('<p>Food ' +food+ '</p>')
      // $('.comparison').append('<p> Hotels and Restaurant ' +restaurant+ '</p>')
    }
  })
//GENERAL country information - country name / official name / capital / subregion
  $.get('https://restcountries.eu/rest/v1/alpha/'+countryTo.A2, function(general) {

    var lastElement = general.altSpellings.length - 1;
    console.log(general)
    // $('.general').append('<img src="images/flag.svg" width="+40px+" height="40px+" alt="flag">')
    $('.general').prepend('<div><h1><img src="images/flag.svg" alt="flag">'+general.name+'</h1><h3>'+general.altSpellings[lastElement]+'</h3><div>')
    $('.extra').append('<div><img src="images/star.svg" alt="capital"><p>'+general.capital+'</p></div>')
    $('.extra').append('<div><img src="images/continent.svg" alt="continent"><p>'+general.subregion+'</p></div>')
    $('.extra').append('<div><img src="images/piggy.svg" alt="flag"><p>'+general.currencies[0]+'</p></div>')
    })


// Call for SAFETY information
var tuGroup = {
"url": "https://api.tugroup.com/v1/travelsafe/countries/"+countryTo.A2,
"method": "GET",
"headers": {
  "x-auth-api-key": "um59hvs6gx8z674reuqmtzna",
  }
}
$.ajax(tuGroup).done(function (safety) {
  $('.safety').append('<h2> Safety </h2>')
  $('.safety').append('<p>'+safety.advisories.description+'</p>')
  var regional = safety.advisories.regionalAdvisories;

// Regional Advisories - loop to print category n description --
  regional.forEach(function(item, index){
    $('.safety').append('<p>' +item.category+ '</p>')
    $('.safety').append('<p>' +item.description+ '</p>')
    })
  })
$.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6046bd3b0b0209c90dcfb95e499d4248&text='+countryTo.country+'%2C+architecture%2C+landscape&sort=relevance&accuracy=3&format=json&nojsoncallback=1', function(result){
  console.log(result)
  var pics = result.photos.photo;
  $('.pictures').prepend('<h2> Random pictures from '+countryTo.country+'</h2>' )
  $('.pics').append('<img src=https://farm'+pics[0].farm+'.staticflickr.com/'+pics[0].server+'/'+pics[0].id+'_'+pics[0].secret+'.jpg</img>')
  $('.pics').append('<img src=https://farm'+pics[3].farm+'.staticflickr.com/'+pics[3].server+'/'+pics[3].id+'_'+pics[3].secret+'.jpg</img>')
  $('.pics').append('<img src=https://farm'+pics[7].farm+'.staticflickr.com/'+pics[7].server+'/'+pics[7].id+'_'+pics[7].secret+'.jpg</img>')
})

})
})
})

//
// Key:
// 6046bd3b0b0209c90dcfb95e499d4248
//
// Secret:
// a5e4d776823b2fe3
