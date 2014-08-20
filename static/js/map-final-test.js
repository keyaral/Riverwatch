//***********************************************************************//
//                           Global Variables                            //
//***********************************************************************//

var map;

var styles; // map style options (roads, labels etc)
var regions = [];
var riverLayer;
var lakeLayer;
var streamLayer;
var layerOn = false;
var submission;
var university = new google.maps.LatLng(-41.29009971493793, 174.76815266036988);
var townLabels = false; // display labels
var regionFillCol = '#FFFFFF';
var regionStrokeCol = '#2B547E';
var regionFillColShow = '#2B547E';
var regionStrokeColShow = '#2B547E';
var regionFillOpacity = 0.05;
var regionFillOpacityShow = 0.00;
var regionFillOpacityMouse = 0.15;
var regionStrokeWeight = 1;
var regionStrokeWeightShow = 2;
var showAll;
var geocoder;
var searchMarker = new google.maps.Marker;

var points;
var unapproved;
google.maps.visualRefresh = true;


//***********************************************************************//
//                              Functions                                //
//***********************************************************************//
function codeAddress(address) {

  var address = document.getElementById('address').value;
  geocoder.geocode( { 'address': address, 'region': 'nz'}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.panTo(results[0].geometry.location);
      var infowindow = new google.maps.InfoWindow();
      infowindow.setContent(results[0].formatted_address); 
      searchMarker.setVisible(false);
      searchMarker = new google.maps.Marker({
         position: results[0].geometry.location,
	 map: map,
         visible: true,
      });
      searchMarker.setMap(map);
      searchMarker.setVisible(true);
      infowindow.open(map,searchMarker);
      map.setZoom(10);
      regionDropdown("All");
      
  } else {
      alert('Couldnt geocode that address, try again');
  }
});
  
}

function pointChooser(){
	
	$("#lat").val(university.lat());
    $("#lng").val(university.lng());
    var infoWindowOpts = {disableAutoPan:true};
    var infowindow = new google.maps.InfoWindow(infoWindowOpts);
    var clicked = false;
    var markerOpts = {
        map:map,
        draggable:true,
        position:university 
    };
    var marker = new google.maps.Marker(markerOpts);

    google.maps.event.addListener(map, "mousedown", function(data){


    });
    google.maps.event.addListener(map, "mouseup", function(data){
        	// console.log("unclicked");
        	var latlng = data.latLng;
        	marker.setPosition(new google.maps.LatLng(latlng.lat(),latlng.lng()));
        	$("#lat").val(latlng.lat());
          $("#lng").val(latlng.lng());
          geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               if (results[1]) {

                 marker.setPosition(latlng);
                 infowindow.setContent(results[1].formatted_address);
                 infowindow.open(map, marker);
             } else {
                 marker.setPosition(latlng);
                 infowindow.setContent("Cannot Geocode This Address");
                 infowindow.open(map, marker);
             }
         } else {
             marker.setPosition(latlng);
             infowindow.setContent("Geocoding failed, try again");
             infowindow.open(map, marker);

         }
     });

      });

google.maps.event.addListener(marker, "mouseup", function(data){
   var latlng = data.latLng;
   $("#lat").val(latlng.lat());
   $("#lng").val(latlng.lng());
   geocoder.geocode({'latLng': latlng}, function(results, status) {
       if (status == google.maps.GeocoderStatus.OK) {
           if (results[1]) {

             marker.setPosition(latlng);
             infowindow.setContent(results[1].formatted_address);
             infowindow.open(map, marker);
         } else {
             marker.setPosition(latlng);
             infowindow.setContent("Cannot Geocode This Address");
             infowindow.open(map, marker);
         }
     } else {
         marker.setPosition(latlng);
         infowindow.setContent("Geocoding failed, try again");
         infowindow.open(map, marker);

     }
 });

});
}
function loadLayers() {
    //NZ Rivers (wide sections) and NZ Lakes provided by Land Information New Zealand via Koordinates.com
    riverLayer = new google.maps.FusionTablesLayer({
        map : map,
        clickable: false,
        suppressInfoWindows: true,
        heatmap : {
            enabled : false
        },
        query : {
            select : "col4",
            from : "1Cb9of1mmMn9YLrIFUlQe0wnOMZg-0zqQTRRJHT0",
            where : ""
        },
        options : {
            styleId : 2,
            templateId : 2,
            
        }
    });

    lakeLayer = new google.maps.FusionTablesLayer({
        map : map,
        clickable: false,
        suppressInfoWindows: true,
        heatmap : {
            enabled : false
        },
        query : {
            select : "col10",
            from : "1_sDMfg9NEPd9WiwUe4OIxCSfO_A7Nr1p-TjTpUM",
            where : ""
        },
        options : {
            styleId : 2,
            templateId : 2,
            

        }
    });
    streamLayer = new google.maps.FusionTablesLayer({
      map: map,
      clickable: false,
      suppressInfoWindows: true,
      heatmap: { enabled: false },
      query: {
        select: "col5",
        from: "10mZlNfAvUa0dS17NlwOoO-j8a-wMiUQaasduYgM",
        where: ""
    },
    options: {
        styleId: 2,
        templateId: 2,
        
    }
});

    councilLayer = new google.maps.FusionTablesLayer({
      map: map,
      clickable: false,
      suppressInfoWindows: true,
      heatmap: { enabled: false },
      query: {
        select: "col4",
        from: "160AS0C_ptpV3oVlDRAUayrP2jeHMZs0SFQPva_U",
        where: ""
    },
    options: {
        styleId: 2,
        templateId: 2
    }
});
    // setTimeout(function(){ 
    //     $("img[src*='googleapis']").each(function(){ 
    //             $(this).attr("src",$(this).attr("src")+"&"+(new Date()).getTime()); 
    //     }); 
    // },3000); 
riverLayer.setMap(null);
streamLayer.setMap(null);
lakeLayer.setMap(null);
councilLayer.setMap(null);

}

//-----------------Display river overlay
function displayRivers() {
    if (riverLayer.getMap() == null && lakeLayer.getMap() == null) {
        riverLayer.setMap(map);
        lakeLayer.setMap(map);
        if(map.getZoom()>10){
            streamLayer.setMap(map);
        }
        layerOn = true;

    } else {
        riverLayer.setMap(null);
        lakeLayer.setMap(null);
        streamLayer.setMap(null);
        layerOn = false;
    }
}


function createInfoWindow(fileName, title, description, date, tags, user, id) {
//max-height:'+$(window).height()*0.75+'px;
var contentString = '<style>overflow:auto</style>'+
'<div class="panel panel-info" style="max-width:258px; width:100%; margin-left: auto; margin-right: auto; word-wrap: break-word;margin-bottom:0px">'+
'<div class="panel-heading"  style="max-height:84px; overflow:auto">'+
'<h3> '+ title + '</h3>' +
'</div>'+
'<a href="'+'/image/'+id+''+ '"><img style="width:100%; margin-left: auto; margin-right: auto;" class="img-thumbnail" src="' +fileName +'" /></img></a>' +    
'<div class ="panel-footer" style="max-height:200px; overflow:auto; overflow-x: hidden">'+
'<p ><b>Description:</b> '+ description +'</p>' +
'<p><b>Uploaded:</b> '+ date +'</p>' +
'<p><b>Tags:</b> ' + tags +'</p>' +
'<p><b>Submitted by:</b> ' + user +'</p>' +
'</div>'+


'</div>'+
'<div class="btn-group btn-group-justified" style="max-width:258px;">'+
'<a type="button" class="btn btn-info" onclick="location.href='+"'"+'/image/'+id+''+"'"+'" >Details</a>'+
    // '<a type="button" class="btn btn-danger" onclick="location.href='+"'"+'/image/'+id+''+"'"+'" >Delete</a>'+
    '<a type="button" class="btn btn-default" href="#" onclick="closeAllInfoWindows()">Close</a'+
    '</div>';
    // '<button type="button" class="btn btn-danger" onclick="location.href='+"'"+'/image/'+id+''+"'"+'" >Delete</button>';

    info = new google.maps.InfoWindow({
        content: contentString
        
    });
   // info.setZIndex(google.maps.InfoWindow.MAX_ZINDEX + 1);

    return info;

}

//-----------------Create a marker
function createMarkers(point, iconName, info) {



    var location =  new google.maps.LatLng(point.lat, point.lng);

    var bool = false;
    if(iconName == null){
        iconName = '/static/images/blue-drop.png';
        
    }

    for ( var i = 0; i < regions.length; i++) {
        if(bool == true)
            break;
        if(google.maps.geometry.poly.containsLocation(location,
            regions[i].polygon)) {
            var temp = new google.maps.Marker({
                position : location,
                map : this.map,
                icon : iconName,
            });

        temp.info = info;
        temp.setVisible(false);
        temp.setMap(map);
        tempWaterMarker = new waterMarker(temp, point.tags.split(", "), new Date(point.date), point.description, point.image_name, point.id);
        
        regions[i].markers.push(tempWaterMarker);
        bool = true;
    }
}
}

//-----------------Show/hide markers in a region
function toggleRegionMarkers(region) {

    for ( var i = 0; i < region.markers.length; i++) {

        if (region.markers[i].marker.getVisible() == true && region.markers[i].filtered == false) {
            var temp = region.markers[i].marker;
            temp.setVisible(false);
            temp.info.close();
            region.text.setMap(map);
            region.markers[i].marker = temp;
        } else {
            if(region.markers[i].filtered == false){ 
                region.text.setMap(null);
                temp = region.markers[i].marker;
                temp.setVisible(true);
                region.markers[i].marker = temp;
            }
        }
    }
}
function closeAllInfoWindows(){
    for ( var i = 0; i < regions.length; i++) {
        for ( var j = 0; j < regions[i].markers.length; j++) {
                // if (regions[i].markers[j].marker != marker)
                regions[i].markers[j].marker.info.close(); // close all other info windows
            }
        }
    }
//------------------Adds an event listener to a marker to open/close its infowindow
function addMarkerListener(marker) {
    google.maps.event.addListener(marker, 'click', function() {

        closeAllInfoWindows()
        if (marker.info.getMap() == null){
            marker.info.open(map, marker);

        }
        else
            marker.info.close();
    });
}

//-----------------Region object
function region(name, polygon) {

    this.polygon = polygon;
    this.name = name;
    this.markers = [];
    this.selected = false;
    this.center = null;
    this.text = null;
}

//----------------Marker Object
function waterMarker(marker, tags, date, description, title, id){

    this.marker = marker;
    this.tags = tags;
    this.id = id;
    this.date = date;
    this.description = description
    this.title = title;
    this.filtered = false;
}

//-----------------Construct a polygon for a region
function constructPolygon(coordinates, name) {
    //NZ Regional Councils (2008 Yearly Pattern) provided by Statistics New Zealand
    var r = new region(name, new google.maps.Polygon({
        paths : coordinates,
        strokeColor : regionStrokeCol,
        strokeOpacity : 0.8,
        strokeWeight : regionStrokeWeight,
        fillColor : regionFillCol,
        fillOpacity : regionFillOpacity,
//        zIndex: -2,
    }));
    var centerCoords = new google.maps.LatLngBounds();
    for (i = 0; i < coordinates.length; i++) {
        centerCoords.extend(coordinates[i]);
    }
    r.polygon.setMap(map);

    r.center = centerCoords.getCenter();
    regions.push(r);
}

//-----------------Add event handlers to a region
function AddEventHandlers(region) {
    google.maps.event.addListener(region.polygon, 'click', function() {
        regionSelector(region.polygon);
        toggleRegionMarkers(region);
    });

    google.maps.event.addListener(region.polygon, 'mouseover', function() {
        if (region.polygon.get('fillOpacity') == regionFillOpacity)
            region.polygon.setOptions({
                fillOpacity : regionFillOpacityMouse
            });
    });

    google.maps.event.addListener(region.polygon, 'mouseout', function() {
        if (region.polygon.get('fillOpacity') == regionFillOpacityMouse)
            region.polygon.setOptions({
                fillOpacity : regionFillOpacity
            });
    });
}

//-----------------Determine the selected region
function regionDropdown(selectedRegion) {
  DeselectRegions();

  if (selectedRegion == "All") {
    for ( var i = 0; i < regions.length; i++) {
        regions[i].text.setMap(null);
        regions[i].polygon.setOptions({
            fillColor : regionFillColShow,
            fillOpacity : regionFillOpacityShow,
            strokeColor : regionStrokeColShow,
            strokeWeight : regionStrokeWeightShow
        });
        for ( var j = 0; j < regions[i].markers.length; j++) {
            if(regions[i].markers[j].filtered == false){
                regions[i].markers[j].marker.setVisible(true);
            }
        }
    }
} else {
    for ( var i = 0; i < regions.length; i++) {
        if (selectedRegion == regions[i].name) {
            regions[i].text.setMap(null);
            regions[i].polygon.setOptions({
                fillColor : regionFillColShow,
                fillOpacity : regionFillOpacityShow,
                strokeColor : regionStrokeColShow,
                strokeWeight : regionStrokeWeightShow
            });
            toggleRegionMarkers(regions[i]);
            break;
        }
    }
}
}


function regionSelector(regionPoly) {

    if (regionPoly == null) { // multibox control
        DeselectRegions();

        if (regionName == "All") {
            for ( var i = 0; i < regions.length; i++) {
                regions[i].text.setMap(null);
                regions[i].polygon.setOptions({
                    fillColor : regionFillColShow,
                    fillOpacity : regionFillOpacityShow,
                    strokeColor : regionStrokeColShow,
                    strokeWeight : regionStrokeWeightShow
                });
                for ( var j = 0; j < regions[i].markers.length; j++) {
                    if(regions[i].markers[j].filtered == false){
                        regions[i].markers[j].marker.setVisible(true);
                    }
                }
            }
        } else {
            for ( var i = 0; i < regions.length; i++) {
                if (regionName == regions[i].name) {
                    regions[i].text.setMap(null);
                    regions[i].polygon.setOptions({
                        fillColor : regionFillColShow,
                        fillOpacity : regionFillOpacityShow,
                        strokeColor : regionStrokeColShow,
                        strokeWeight : regionStrokeWeightShow
                    });
                    toggleRegionMarkers(regions[i]);
                    break;
                }
            }
        }
    } else { // user click control
        if (regionPoly.get('fillOpacity') == regionFillOpacityShow){
            regionPoly.setOptions({
                fillOpacity : regionFillOpacity,
                fillColor : regionFillCol,
                strokeColor : regionStrokeCol,
                strokeWeight : regionStrokeWeight
            });


            
        }
        else{

            regionPoly.setOptions({
                fillColor : regionFillColShow,
                fillOpacity : regionFillOpacityShow,
                strokeColor : regionStrokeColShow,
                strokeWeight : regionStrokeWeightShow
            });
        }
    }
}

//-----------------Deselect all regions
function DeselectRegions() {
    for ( var i = 0; i < regions.length; i++) {
        regions[i].text.setMap(map);
        regions[i].polygon.setOptions({
            fillColor : regionFillCol,
            fillOpacity : regionFillOpacity,
            strokeColor : regionStrokeCol,
            strokeWeight : regionStrokeWeight
        });
        regions[i].text.setMap(map);
        for ( var j = 0; j < regions[i].markers.length; j++) {
            if(regions[i].markers[j].filtered == false){
                regions[i].markers[j].marker.setVisible(false);
            }
            regions[i].markers[j].marker.info.close();
        }
    }
}






//***********************************************************************//
//                            Create the Map                             //
//***********************************************************************//
function initialize() {

    var mapCanvas = document.getElementById('map_canvas');
    var mapOptions = {
        zIndex: -1,
        center : new google.maps.LatLng(-41, 172),
        zoom : 10,
        mapTypeId : google.maps.MapTypeId.ROADMAP,//TERRAIN, //ROADMAP SATELLITE
        panControl : false,
        streetViewControl : false,
        scaleControl : true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        disableDoubleClickZoom : true,
        zoomControlOptions : {
            style : google.maps.ZoomControlStyle.DEFAULT,
            position : google.maps.ControlPosition.RIGHT_CENTER
        }
    };
    map = new google.maps.Map(mapCanvas, mapOptions);
    geocoder = new google.maps.Geocoder();

   
    //-----------------Limit the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (map.getZoom() < 5){
            map.setZoom(5);
        }
        
        if(map.getZoom()>10){ 
            if(layerOn){
             streamLayer.setMap(map);
         }
     }
     else{
       streamLayer.setMap(null);
   }
});
    
    

    //-----------------Set the map style
    styles = [ {
        featureType : "road", // turn off roads
        stylers : [ {
            visibility : "off"
        } ]
    }, {
        featureType : "poi", // hide 'points of interest'
        stylers : [ {
            visibility : "off"
        } ]
    }, {
        featureType : "transit",
        stylers : [ {
            visibility : "off"
        } ]
    }, {
        featureType : "all", // hide all labels
        elementType : "labels",
        stylers : [ {
            visibility : "off"
        } ]
    }, {
        featureType : "water", // water colour + labels
        elementType : "geometry.fill",
        stylers : [ {
            color : "#99b3cc"
        } //2B547E 3090C7
        ]
    }, {
        featureType : "water",
        elementType : "labels.text.stroke",
        stylers : [ {
            visibility : "on"
        }, {
            color : "#FF0000"
        }, ]
    }, {
        featureType : "water",
        elementType : "labels.text.fill",
        stylers : [ {
            visibility : "on"
        }, {
            color : "#FFFFFF"
        }, {
            weight : 25
        } ]
    }, {
        featureType : "landscape", // country colour
        elementType : "geometry.fill",
        stylers : [ {
            color : "#c7d9a7"
        }, //#D1D0CE
        ]
    }, {
        featureType : "administrative.province", // region borders
        elementType : "all",
        stylers : [ {
            visibility : "off"
        }, ]
    } ];
    map.setOptions({
        styles : styles
    });

    google.maps.event.addListener(map, 'maptypeid_changed',
        function() {
            if (map.getMapTypeId() == 'satellite'
               || map.getMapTypeId() == 'hybrid') {
               regionStrokeCol = '#FFFFFF';
           regionStrokeColShow = '#FFFFFF';
       } else if (map.getMapTypeId() == 'terrain') {
        regionStrokeCol = '#2B547E';
        regionStrokeColShow = '#2B547E';
    } else if (map.getMapTypeId() == 'roadmap') {
        regionStrokeCol = '#2B547E';
        regionStrokeColShow = '#2B547E';
    }
    DeselectRegions();
});
    
    

    if(submission){
      pointChooser();
      
  }
  else{
      submission = false;
      //-----------------Construct regional overlays
      constructPolygon(loadNorthland(), "Northland");
      constructPolygon(loadAuckland(), "Auckland");
      constructPolygon(loadWaikato(), "Waikato");
      constructPolygon(loadWestcoast(), "West Coast");
      constructPolygon(loadBayofplenty(), "Bay of Plenty");
      constructPolygon(loadCanterbury(), "Canterbury");
      constructPolygon(loadGisborne(), "Gisborne");
      constructPolygon(loadOtago(), "Otago");
      constructPolygon(loadSouthland(), "Southland");
      constructPolygon(loadHawkesbay(), "Hawke's Bay");
      constructPolygon(loadTasman(), "Tasman");
      constructPolygon(loadTaranaki(), "Taranaki");
      constructPolygon(loadManawatu(), "Manawatu-Wanganui");
      constructPolygon(loadNelson(), "Nelson");
      constructPolygon(loadWellington(), "Wellington");   
      constructPolygon(loadMarlborough(), "Marlborough");
      for ( var i = 0; i < regions.length; i++)
        AddEventHandlers(regions[i]);
}

    // Import data from API stored as JSON using jQuery (AJAX) 
    // TO BE COMPLETED
    // var done = false;
    // $.getJSON('/api/export', function(data) {
    	
    //     $.each( data, function( key, val ) {
    //     	if(key != "status"){
    //         points.push(val);
    //         // console.log(key+" "+ val.extension +" "+ val.image_name +" "+ val.path +" "+ val.lat +" "+ val.lng +" "+ val.id); // Something like this
    //         // console.log(points.length)
    //     }

    //     });
finish();

    // });

function finish(){
    if(points!=undefined){
        for ( var i = 0; i < points.length; i++){
    	       // console.log(points[i].image_name +"\t"+ points[i].path +"\t"+ points[i].extension +"\t"+  points[i].lat +"\t"+ points[i].lng +"\t"+points[i].date +"\t"+ points[i].id+"\t"+ points[i].tags+"\t"+ points[i].user);
               createMarkers(
                 points[i],
                 null,
                 createInfoWindow("" + points[i].path + "-thumb."
                    + points[i].extension + "", points[i].image_name,
                    points[i].description, new Date(points[i].date).toLocaleDateString(), points[i].tags, points[i].user ,points[i].id));
           }
       }
       if(unapproved!=undefined){
        for ( var i = 0; i < unapproved.length; i++){
                   // console.log(points[i].image_name +"\t"+ points[i].path +"\t"+ points[i].extension +"\t"+  points[i].lat +"\t"+ points[i].lng +"\t"+points[i].date +"\t"+ points[i].id+"\t"+ points[i].tags+"\t"+ points[i].user);
                   createMarkers(
                    unapproved[i],
                    '/static/images/yellow-drop.png',
                    createInfoWindow("" + unapproved[i].path + "-thumb."
                        + unapproved[i].extension + "", unapproved[i].image_name+" {Unapproved}",
                        unapproved[i].description, new Date(unapproved[i].date).toLocaleDateString(), unapproved[i].tags, unapproved[i].user ,unapproved[i].id));
               }
           }

    //Set labels
    for(var i=0; i < regions.length; i++){
       if(regions[i].name == "Wellington"){
           var mapLabel = {
               text: regions[i].markers.length,
               position: regions[i].center,
               map: map,
               fontSize: 20,
               fontColor: 'white',
               strokeColor: regionStrokeCol,
               fillOpacity: 1,
               strokeOpacity: 1,
           };
       }
       else {

           var mapLabel = {
               text: regions[i].markers.length,
               position: regions[i].center,
               map: map,
               fontColor: 'white',
               strokeColor: regionStrokeCol,
               fontSize: 20,
           };
       }

       var label = new MapLabel(mapLabel)
       
       regions[i].text = label;
   }




    //-----------------Add event handlers       
    for ( var i = 0; i < regions.length; i++) {
        for ( var j = 0; j < regions[i].markers.length; j++) {
            addMarkerListener(regions[i].markers[j].marker);
        }
    }
    //-----------------Load the river + lake overlay

    // var imgLocation =new google.maps.LatLng(-41, 172);
    // var marker = new google.maps.Marker({map:map, position: imgLocation});
    // marker.setMap(map);
    loadLayers();
    if(submission){
      councilLayer.setMap(map);
  }
  if(showAll){
    regionDropdown("All");
}
displayRivers();
}


}
google.maps.event.addDomListener(window, 'load', initialize);
