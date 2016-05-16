$(document).ready(function() {
var countryTo = {}
var countryFrom = {}
var specific;
var specific2;


$.get('https://restcountries.eu/rest/v1/all', function(countryList) {
  countryList.forEach(function(item, index) {
    $('select').append('<option value='+item.alpha2Code+'>'+ item.name + '</option>')
  })

  console.log("Testing option list: " + countryList[0].name)
})


$('button').click(function(event) {
  event.preventDefault()
  specific = $('select.to option:selected').val()
  specific2 = $('select.from option:selected').val()

console.log(specific)
console.log(specific2)


$.get('https://restcountries.eu/rest/v1/alpha?codes='+specific+';'+specific2+'', function(data) {
  console.log(data)
  countryTo.A2 = data[0].alpha2Code;
  countryTo.currency = data[0].currencies[0];
  countryFrom.A2 = data[1].alpha2Code;
  countryFrom.currency = data[1].currencies[0];
})

$.get("https://knoema.com/api/1.0/meta/dataset/WBWDIGDF/regions", function(region) {
  // var regionLog = region.items
  var regionLog = region[0].regions;
  console.log(region)
  console.log(region[0].regions[0].regionId)
  regionLog.forEach(function(item, index) {
    if (item.regionId === specific) {
      countryTo.id = item.key
    }
    if (item.regionId === specific2) {
      countryFrom.id = item.key
    }
  })
  console.log(countryTo)
  console.log(countryFrom)
  })
  })
})




// // Creating list of countries in the dropdown menu ---
// $.get("https://knoema.com/api/1.0/meta/dataset/ICPR2011/dimension/region", function(region) {
//     var regionLog = region;
//     len = regionLog.items.length
//     for (var i = 13; i < len; i++) {
//       $('select').append('<option>'+ regionLog.items[i].name + '</option>')
//     }
//
// })
// //General Country Info --- Need regular Country Name String ----
// $.get("https://restcountries.eu/rest/v1/name/"+"china", function(country) {
//
//   var countryLog = country;
//   var lastElement = countryLog[0].altSpellings.length - 1;
//   console.log(lastElement)
//   console.log(countryLog);
//   console.log(countryLog[0].altSpellings[lastElement])
//   console.log(countryLog[0].capital)
//   console.log(countryLog[0].region)
//   console.log(countryLog[0].subregion)
//   countryLog[0].languages.forEach(function(item, index){
//     console.log(item);
//   })
//
// // GET CURRENCY ------ NEED CURRENCY 3 letter code!!!
// }).done(function(currency) {
//   var currency = currency[0].currencies[0]
//   console.log(currency)
// $.get('http://api.fixer.io/latest?base=USD&symbols='+currency+'', function(curr) {
//     console.log(curr.rates[currency])
//   })
// })
// // GET FINANCIAL COMPARATIVE PRICES INFORMATION --- Need special ID ex.1001640
//   $.get("https://knoema.com/api/1.0/data/ICPR2011?Time=2011-2011&region=1001640,1001650,1001670&measures-components=1000270,1000260,1000360&economic-aggregates=1000190&Frequencies=A", function(data) {
//       var dataLog = data;
//       console.log(dataLog)
//       console.log(dataLog.data[0].Value)
//   })
//
//
// //GET TRAVEL ADVISORY ---- *** NEED 2 letter country codes ***
//   var settings = {
//   // "async": true,
//   // "crossDomain": true,
//   "url": "https://api.tugroup.com/v1/travelsafe/countries/mx",
//   "method": "GET",
//   "headers": {
//     "x-auth-api-key": "um59hvs6gx8z674reuqmtzna",
//     // "cache-control": "no-cache",
//     // "postman-token": "1cceb0ec-2ca2-fbc4-b2d8-db2d0577c216"
//   }
// }
//
// $.ajax(settings).done(function (response) {
//   console.log(response);
//   console.log(response.advisories.description)
//   console.log(response.advisoryText)
//   console.log(response.advisories.regionalAdvisories[0].category)
//   var advisory = response.advisories.regionalAdvisories;
// // Regional Advisories - loop to print category n description --
//   advisory.forEach(function(item, index){
//     console.log(item.category)
//     console.log(item.description)
//   })
//
//   })
// })
// // ----- 3 things to do --------
//
//
//
//
//
//
//
//   // $.get("https://knoema.com/api/1.0/meta/dataset/ICPR2011/dimension/region", function(region) {
//   //     var regionLog = region;
//   //     console.log(regionLog)
//   //     if (regionLog.items[0].name === "World") {
//   //       console.log("You did it")
//   //     }
//   //   })
