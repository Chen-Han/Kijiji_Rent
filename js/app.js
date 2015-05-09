/**
 * Created by Han Chen on 09/05/2015.
 */

  /**
   * To hack Kijiji, check source, search submitForm and contactPoster, you can see the the form is serialized, and posted to the URL*/
var app = angular.module("app", ["uiGmapgoogle-maps"]);
app.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCluec9Skc0lFk94PFcqIauxwehyn1p-dU',
    v: '3.17',
    libraries: 'weather,geometry,visualization'
  });
});
app.controller("MainCtrl", ["$scope", "$rootScope", "uiGmapLogger",
  /*'drawChannel', 'clearChannel',*/ 'uiGmapGoogleMapApi', "$http","$q","$timeout",
  function ($scope, $rootScope, uiGmapLogger,/*drawChannel, clearChannel,*/ GoogleMapApi, $http,$q,$timeout) {
    var defaultlat = 43.4711753;
    var defaultlng = -80.5531673;
    var center = {latitude: defaultlat,
      longitude: defaultlng};

    var defaultMarkerCenter = angular.copy(center);
    GoogleMapApi.then(function (maps) { //maps is an instance of google map


      $scope.locations = [];
      $scope.windows=[];
      $scope.map = {
        center: center,
        control: {},
        pan: true,
        zoom: 14,
        refresh: true,
        events: {},
        bounds: {},
        polys: [],
        draw: undefined
      };
      //console.log(Locations);
      $http.get("http://localhost:8080").then(function (res) {
        if (!res || res.data.type == "error") {
          alert("error");
          console.log(res);
          return;
        }
        console.log(res);
        var counter=0;
        var temp = angular.forEach(res.data, function (i) {
          var window = {
            idKey:counter, //don't increment the counter, will be used again in location
            center: defaultMarkerCenter,
            options: {
              //note that window can also be loaded with a templateUrl
              content: '<div><h4>Waterloo</h4>' +
                '<p>' + i.innerAd.info.address +
                '</p></div>'
            },
            show: true
          };
          var location = {
            idKey: counter++,
            center: defaultMarkerCenter,
            //labelContent: i.innerAd.info.price,
            //city: 'Some City',
            //address: '123 King Str',
            //link: 'Link to a page for more info',
            options: {
              labelContent: i.innerAd.info.price,
              draggable: false
            },
            show:false,
            templateUrl:"js/windowTemplate.html",
            templateParameter:{'i':i},

            windowOptions:{
              /*content: '<ul style="list-style: none"><li>' +
                '<strong>Address &nbsp;</strong>'+i.innerAd.info.address+'</li>' +
              '<li><a href="'+ i.link+'" target="_blank">'+ i.link+'</a></li>' +
                '<li>'+ i.innerAd.info.price+'</li>' +
                '</ul>'*/
            }
          };
          location.onClick=function(){location.show=!location.show};
          window.closeClick = function(){
            window.show=!window.show;
          };
          $scope.locations.push(location);
          $scope.windows.push(window);
          //console.log($scope.locations);
          var j = i; //save the obj reference so it is not mutated
          //console.log(j.innerAd.info.address);
          $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+j.innerAd.info.address+ '&region=CA')
            // After getting the results
            .then(function (results) {
              console.log(results);
              // If the call was successful
              if (results.data.status=== "OK") {
                // setting the addressArray to the results of the call.
                console.log("got response from geocode");
                //set the location in service
                window.center=location.center = {
                  latitude: results.data.results[0].geometry.location.lat,
                  longitude: results.data.results[0].geometry.location.lng
                };
                console.log(location.center);
              }
            });


        });

      });
      //$timeout(function(){$scope.$apply();},8000);
    });
    //add beginDraw as a subscriber to be invoked by the channel, allows controller to controller coms
    //drawChannel.add(draw);
    //clearChannel.add(clear);
  }]);