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

// CURRENCY CALCULATOR - change if possible -----
  $.get('http://api.fixer.io/latest?base='+countryFrom.currency+'&symbols='+countryTo.currency+'', function(currency) {
      $('section:first-of-type +section').empty()
    if (countryFrom.currency === countryTo.currency) {
      $('section:first-of-type +section').append("Both countries have the same currency! No need to exchange!!!")
    } else if (currency.rates[countryTo.currency] === undefined){
      $('section:first-of-type +section').append('Sorry, no information on that exchange rate check out:')
    }else {
      $('section:first-of-type +section').append('1 '+countryFrom.currency+' gets you a whooping ' +currency.rates[countryTo.currency]+' '+countryTo.currency)
    }
  })
// FINANCIAL Purchasing power parity stats -- how to display??
  $.get('https://knoema.com/api/1.0/data/ICPR2011?Time=2011-2011&region='
  +countryFrom.id+','+countryTo.id+'&measures-components=1000270,1000260,1000360&economic-aggregates=1000190&Frequencies=A', function(financial) {

    PPP = financial.data //Purchasing Power Parity //

    var alcohol =100 -  Math.round(((PPP[0].Value - PPP[3].Value) / PPP[0].Value) *100)-100;
    var food = 100 - Math.round(((PPP[1].Value - PPP[4].Value) / PPP[1].Value * 100)-100);
    var restaurant = 100 - Math.round(((PPP[2].Value - PPP[5].Value) / PPP[2].Value * 100)-100);

    console.log("Alcohol will be " +alcohol+ " Food will be " +food+ " Hotels " +restaurant)
  })
//GENERAL country information - country name / official name / capital / subregion
  $.get('https://restcountries.eu/rest/v1/alpha/'+countryTo.A2, function(general) {

    var lastElement = general.altSpellings.length - 1;
    console.log(general)
    $('section:first-of-type').empty()
    $('section:first-of-type').append('<p>Country: '+general.name+'<p>')
    $('section:first-of-type').append('<p> Official Name: '+general.altSpellings[lastElement]+'<p>')
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

  console.log(safety);
  console.log(safety.advisories.description)
  var regional = safety.advisories.regionalAdvisories;
// Regional Advisories - loop to print category n description --
  regional.forEach(function(item, index){
    console.log(item.category)
    console.log(item.description)

    })
  })
})
})
})
