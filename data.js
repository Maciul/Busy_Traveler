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
  $('.comparison').empty()
  $('section:first-of-type +section').empty()
  $('section:first-of-type').empty()
  $('section:last-of-type').empty()
// Getting values for calling different API's //
$.when( $.ajax( 'https://restcountries.eu/rest/v1/alpha?codes='+specific+';'+specific2+'' ),
        $.ajax('https://knoema.com/api/1.0/meta/dataset/ICPR2011/dimension/region' ) ).done(function(data, region) {
// Get the country a2 code and currency //
  countryTo.A2 = data[0][0].alpha2Code;
  countryTo.currency = data[0][0].currencies[0];
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
  $.get('http://api.fixer.io/latest?base='+countryFrom.currency+'&symbols='+countryTo.currency+'').done(function(currency) {
    if (countryFrom.currency === countryTo.currency) {
      $('section:first-of-type +section').append("Both countries have the same currency! No need to exchange!!!")
    } else if (currency.rates[countryTo.currency] === undefined){
      $('section:first-of-type +section').append('Sorry, no information on that exchange rate check out:')
    }else {
      $('section:first-of-type +section').append('1 '+countryFrom.currency+' gets you a whooping ' +currency.rates[countryTo.currency]+' '+countryTo.currency)
    }
  }).fail(function(error) {
    $('section:first-of-type +section').append('No info')
})
// FINANCIAL Purchasing power parity stats -- will display as $100 is worth x amount??
  $.get('https://knoema.com/api/1.0/data/ICPR2011?Time=2011-2011&region='
  +countryFrom.id+','+countryTo.id+'&measures-components=1000270,1000260,1000360&economic-aggregates=1000190&Frequencies=A', function(financial) {
    console.log(financial);
        console.log(financial.data.length)
      PPP = financial.data //Purchasing Power Parity //
      if (PPP.length < 6) {
        $('.comparison').append('<p>Even World Bank does not have enought data to figure this out!</p>')
      } else {
      var alcohol = Math.round(100 / (1 - ((PPP[0].Value - PPP[3].Value) / PPP[0].Value)))
      var food = Math.round(100 / (1 - ((PPP[1].Value - PPP[4].Value) / PPP[1].Value)));
      var restaurant = Math.round(100 / (1 - ((PPP[2].Value - PPP[5].Value) / PPP[2].Value)));
      $('.comparison').append('<p>Alcohol n Tobacco ' +alcohol+ '</p>')
      $('.comparison').append('<p>Food ' +food+ '</p>')
      $('.comparison').append('<p> Hotels and Restaurant ' +restaurant+ '</p>')
    }
  })
//GENERAL country information - country name / official name / capital / subregion
  $.get('https://restcountries.eu/rest/v1/alpha/'+countryTo.A2, function(general) {

    var lastElement = general.altSpellings.length - 1;
    console.log(general)
    $('section:first-of-type').append('<p>Country: '+general.name+'<p>')
    $('section:first-of-type').append('<p>Official Name: '+general.altSpellings[lastElement]+'<p>')
    $('section:first-of-type').append('<p>Capital: '+general.capital+'<p>')
    $('section:first-of-type').append('<p>Region: '+general.subregion+'<p>')
    $('section:first-of-type').append('<p>Currency: '+general.currencies[0]+'<p>')
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
  $('section:last-of-type').append('<p>'+safety.advisories.description+'</p>')
  var regional = safety.advisories.regionalAdvisories;
// Regional Advisories - loop to print category n description --
  regional.forEach(function(item, index){
    $('section:last-of-type').append('<p>' +item.category+ '</p>')
    $('section:last-of-type').append('<p>' +item.description+ '</p>')

    })
  })
})
})
})
