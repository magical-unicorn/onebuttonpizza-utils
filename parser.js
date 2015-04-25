var request = require('request');
var queryString = require('querystring');
var async = require('async');
var Firebase = require("firebase");

var myFirebaseRef = new Firebase("https://crackling-heat-6948.firebaseio.com/");

var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
var details_url = "https://maps.googleapis.com/maps/api/place/details/json";
var google_api_key = "AIzaSyAL5WB-YzKMZTWnpV5PNBNttGcPvHWXvuI";


var params = queryString.stringify({
    location : "49.104853,6.196406",
    radius : 8000,
    types : "meal_takeaway",
    name : "pizza",
    key : google_api_key
});


request(url+'?'+params,function(error, response, body){
    if (!error && response.statusCode == 200){
        body = JSON.parse(body);
        traitement(body);
    }
});

function traitement(body){
    async.each(body.results,function(item,callback){
         var pizzeria = {};
         pizzeria.name = item.name;
         pizzeria.id = item.place_id;
         pizzeria.adress = {
            location : item.geometry.location,
            vicinity : item.vicinity
        };
        pizzeria.rating = item.rating || null;

        var details_param = queryString.stringify({
            placeid : item.place_id,
            key : google_api_key
        });
        request(details_url+'?'+details_param,function(error, response, body){
            if (!error && response.statusCode == 200){
                body = JSON.parse(body);
                pizzeria.opening_hours = body.result.opening_hours;
                var obj_pizza = {};
                myFirebaseRef.child('pizzeria/'+item.place_id).set(pizzeria,function(error){
                    if(error){
                        console.log('Erreur de stockage de '+item.place_id);
                    }else{
                        console.log('Stockage de '+item.place_id+'  ✅');
                    }
                });
                callback();
            }
        });
    },function(err){
        if (err) {
            console.log(err);
        }else{
            console.log('Importation terminée 👍');
        }
    });


}
