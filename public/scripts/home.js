/*jslint browser: true*/
/*global $, jQuery, alert*/
"use strict";
//-------------------------------------------------------------------------
//  replaced all instances of let with var
//  reason: let is not supported by the current version of javascript
//-------------------------------------------------------------------------
//  https://firebase.google.com/docs/web/setup
//
// $ npm install -g firebase-tools
// $ firebase serve
//---------------------------------------------

//----------------------------------------
// Use Firebase services
//----------------------------------------

var games = [];

var ReactThis = null;

function post_results(results) {
    //let table = document.getElementById('result_body');
    var table = $('#result_body');
    table.empty(); //remove any previous results
    var i = 0;
    for (i = 0; i < results.length; i += 1) { //for each result returned, add a row in the table with that result.
        //table.append('<tr><td>' + name + '</td> <td>' + platform + '</td><tr>');  //add game name + platform to new table row
        table.append('<tr><td>' + results[i] + '</td></tr>');
        //add game name + platform to new table row
    }
}

$(document).ready(function() {
    //localStorage.removeItem("user_logged_in");
    //localStorage.removeItem("user_picture");

    var login_html = "";
    if (localStorage.getItem("user_picture") != null) {
        login_html += "<img alt=\"\" width=\"20px\" src=\"" + localStorage.getItem("user_picture") + "\">  ";
    }

    if (localStorage.getItem("user_logged_in") != null)
        login_html += "User: " + localStorage.getItem("user_logged_in");

    console.log(login_html);

    $("#username_display").html(login_html);
});

$('.submit').click(function() {
    var name;
    var platform;

    //##### SEARCHING FOR GAMES #####
    if ($(this).data('submission') === "search_games") {
        name = $('#game_name').val();
        platform = $('#platform_name').val();
    } else
    //##### BROWSING FOR GAMES #####
    {
        name = "";
        platform = $('#platform_name').val();
    }

    get_amazon_results(name, platform, 1);

});

// Prepare list of Amazon items from search
function get_amazon_results(name, platform, page) {
    var built_url = buildRequestURL("https://ecs.amazonaws.com/onca/xml?Service=AWSECommerceService&AssociateTag=tommywil-20&Version=2009-03-31&Operation=ItemSearch&SearchIndex=VideoGames&ItemPage=" + page + "&ResponseGroup=Large&Keywords=" + name + " " + platform + " games");
    display_results(built_url);
}

// Download and build list of results into our local array
function display_results(built_url) {
    var jqxhr = $.ajax({
        url: built_url,
        success: function() {
            var count = 0;

            var xml = jqxhr.responseText;
            var xmlDoc = $.parseXML(xml);
            var $xml = $(xmlDoc);
            var Item = $xml.find("Item");

            $("#result_body").empty();

            Item.each(function() {

                //console.log(Item[i]);

                var title = $(this).find('ItemAttributes').find('Title').text();
                var amazon_price = $(this).find('Offers').find('Offer').find('OfferListing')
                    .find('Price').find('FormattedPrice').text();
                var model = $(this).find('ItemAttributes').find('Model').text();

                //console.log("title: " + title + ", price: " + amazon_price + ", model: " + model);

                amazon_price = Number(amazon_price.replace("$", ""));

                if (amazon_price == 0)
                    amazon_price = " No Data";

                games[count] = {
                    title: title,
                    model: model,
                    amazon_price: amazon_price,
                    bestbuy_price: " No Data"
                };

                count++;
            });

            console.log(games);

            get_bestbuy_prices(0);

            ReactThis.setState({
                page: 0
            });

        }
    });
}

// Get our second set of data by searching the model number on our Amazon results
function get_bestbuy_prices(page) {
    console.log("______________");
    console.log("state " + page);
    var result_offset = page * 5;
    console.log("offset " + result_offset);
    for (var i = 0; i < 5; i++) {
        console.log(i + result_offset);

        var bestbuy_url = "https://api.bestbuy.com/v1/products(modelNumber=" + games[i + result_offset].model + ")?apiKey=9bbf44cbsuf2e8xgcrzqcrkj&sort=name.asc&show=name,salePrice,modelNumber&callback=&format=json";

        var bby = $.ajax({
            url: bestbuy_url,
            dataType: 'json',
            modelNumber: games[i + result_offset].model,
            arrayIndex: i + result_offset,
            success: function(results) {
                var json = results;
                var price = results.products[0].salePrice;

                if (price != null) {
                    games[this.arrayIndex].bestbuy_price = price;
                    console.log("Index " + this.arrayIndex + ", Model: " + this.modelNumber + ", Price: " + price);
                    console.log(results);
                }
            }
        });
    }

    console.log(games);
}

$('.clear_form').click(function() {
    $('#game_name').val("");
    $('#platform_name').val("");
    $('#platform_name2').val("");
});

//This code was taken from a JSFiddle in-class example, and then slightly modified.
function show(id) {
    $('.tab') //Select all elements with tab class
        .removeClass('selected') //From that set, remove the class "selected" from all
        .filter //Now filter all of the tabs by the function below
        (function() {
            return (this.hash === id);
        }) //From the link that has the same # mark as what was clicked, add the selected tag
        .addClass('selected');

    $('.panel') //Select all elements with panel class
        .hide() //Hide all of them
        .filter(id) //Select just the one with the given id
        .show(); //Unhide it
}

//Initialize hash to be search_games
window.onload = function() {
    window.location.hash = '#search_games'
}

//Set a listener so that when we change the #... part of it, we call the function above
$(window).on('hashchange', function() {
    show(location.hash); //show the correct view
    post_results([]); //on view change, clear the table.
});

// initialize by showing the first panel
show('#search_games');