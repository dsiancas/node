'use strict';
angular.module('shellcatchApp.directives').directive('map', function () {
    return {
        scope: {
            tripData: '=',
            boatData: '=',
            viewMode: '=',
            currentBoat: '=',
            resizeMap: '=',
            tripPictures: '=',
            tempStopId: '=',
            selectedItem: '='
        },
        templateUrl: 'partials/map.html',
        controller: [
            '$rootScope', '$scope', '$element', '$compile', '$filter',
            '$timeout', 'apiService', 'utilsService', 'SET_UP_DATASET',
            'COLOR_PALETTE_COUNT', 'READ_TOKEN', 'RELATED_TABLE_URL',
            'RELATED_TABLE_ENTRIES_URL', 'HERE_APP_ID', 'HERE_APP_CODE',
            'LABELS_MAP', 'SQL_URL', 'STOP_DATASET', 'API_ROOT',
            function ($rootScope, $scope, $element, $compile, $filter,
                      $timeout, apiService, utilsService, SET_UP_DATASET,
                      COLOR_PALETTE_COUNT, READ_TOKEN, RELATED_TABLE_URL,
                      RELATED_TABLE_ENTRIES_URL, HERE_APP_ID, HERE_APP_CODE,
                      LABELS_MAP, SQL_URL, STOP_DATASET, API_ROOT) {

                var highlightIcon = L.icon({
                    iconUrl: "../static/img/marker-icon.png",
                    iconRetinaUrl: "../static/img/marker-icon-2x.png",
                    shadowUrl: "../static/img/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                $scope.group = $rootScope.group;
                
                $rootScope.$watch('userData', function (newValue, oldValue) {
                    if (newValue) {
                        $scope.current_group = $rootScope.userData.group;
                    }
                });


                $scope.layerArray = null;
                $scope.readToken = READ_TOKEN;
                $scope.tempDatasets = {};
                $scope.updateBoundingBox = true;
                $scope.loadingData = false;
                $scope.continue = true;

                if ($rootScope.selectedLanguage === 'en') {
                    $scope.translation = translationsEN;
                } else {
                    $scope.translation = translationsES;
                }

                L.amigo.events.on('temp_dataset:creation_succeeded', function (data) {
                    if ($scope.stopsJob && data.temp_dataset_id === $scope.stopsJob.id) {
                        $scope.setUpStopsDataset(data.temp_dataset_id);
                        return;
                    }
                    if ($scope.tripsJob && data.temp_dataset_id === $scope.tripsJob.id) {
                        $scope.setUpTripsDataset(data.temp_dataset_id);
                        return;
                    }
                    $scope.tempDatasets[data.temp_dataset_id] = data;
                });

                L.amigo.events.on('temp_dataset:style_updated', function (data) {
                    if ($scope.stopsData && data.temp_dataset_id === $scope.stopsData.id) {
                        // Updating cache busting and redrawing
                        $scope.stopsData.cache_busting = data.extra.cache_busting;
                        $scope.stops.setUrl($scope.stopsData.tiles + '/{z}/{x}/{y}.png?c=' + $scope.stopsData.cache_busting + '&token=' + READ_TOKEN);
                        $scope.stops.redraw();
                    }
                });

                $rootScope.$watch('selectedLanguage', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        if (newValue === 'en') {
                            $scope.translation = translationsEN;
                        } else {
                            $scope.translation = translationsES;
                        }
                    }
                });

                $scope.$on('event:pointChange', function (event, data) {
                    $scope.highlight(data.amigoId);
                });

                $scope.$on('event:updateLoadingData', function (event, data) {
                    $scope.loadingData = data.value;
                });

                $scope.$watch('selectedItem', function (newValue, oldValue) {
                    if (newValue) {
                        $scope.updateBoundingBox = true;
                        $scope.getData();
                    }
                }, true);

                $scope.$on('$destroy', function () {
                    $('#map').height(0);
                    if ($scope.map) {
                        $scope.map.remove();
                    }
                });

                $scope.openVideo = function (trip) {
                    $scope.$emit('event:open-video-modal', {
                        trip: trip
                    });
                };

                $scope.setUpStopsDataset = function (id) {
                    var data = {
                        "id": id,
                        "hash": $scope.stopsJob.new_name,
                        "is_trip": false
                    };

                    apiService.POST(SET_UP_DATASET, data).then(function (inData) {
                        $scope.stopsData = inData;
                        $scope.tempStopId = $scope.stopsData.id;
                        $scope.setMap();
                    });
                };

                $scope.setUpTripsDataset = function (id) {
                    var data = {
                        "id": id,
                        "hash": $scope.tripsJob.new_name,
                        "is_trip": true
                    };

                    apiService.POST(SET_UP_DATASET, data).then(function (inData) {
                        $scope.tripsData = inData;
                        $scope.setMap();
                    });
                };

                $scope.getData = function () {
                    if (typeof $scope.selectedItem !== 'undefined' &&
                        $scope.selectedItem.boat &&
                        $scope.selectedItem.trip && $scope.continue) {
                        $scope.$emit('event:loadingData', {value: true});
                        $scope.$emit('event:loadingImages', {value: true});
                        $('body #loading_not_maps').show().html('Setting up...');
                        $scope.continue = false;
                        $scope.stopsData = null;
                        $scope.tripsData = null;
                        $scope.stopsJob = null;
                        $scope.tripsJob = null;
                        $scope.tripPictures = [];
                        if ($scope.marker) {
                            $scope.map.removeLayer($scope.marker);
                        }

                        apiService.GET($rootScope.apiRoot.trip_images, {
                                trip: $scope.selectedItem.trip
                            }).then(function (data) {
                                if(data){
                                   if(data.data.length>0){
                                        $scope.$emit('event:loadingImages', {value: false});
                                        $scope.current_image_initial = data.data[0].amigo_id;
                                        var new_data = {
                                            'data': {
                                            'amigoId': $scope.current_image_initial,
                                            'amigo_id': $scope.current_image_initial
                                            }
                                        };
                                        $scope.utfGridClick(new_data);
                                        $scope.$emit('event:pointClick', {
                                            idx: $scope.current_image_initial
                                        });
                                        $('body #loading_not_maps').hide();
                                        $('body #loading_not_maps2').hide();

                                   }else{
                                       $('body #loading_not_maps').show().html('No found maps');
                                   }
                                }

                            }).catch(function(err) {
                                $('body #loading_not_maps2').show().html('Still working...');
                                $scope.getData();
                            });


                        apiService.GET($rootScope.apiRoot.stops, $scope.selectedItem).then(function (data) {
                            $('body #loading_not_maps').show().html(' ');
                            $scope.$emit('event:loadingData', {value: false});
                            if (data.stops.new_name) {
                                $scope.stopsJob = data.stops;
                                $scope.tripsJob = data.trips;
                                if ($scope.tempDatasets[$scope.stopsJob.id]) {
                                    $scope.setUpStopsDataset($scope.stopsJob.id);
                                    delete $scope.tempDatasets[$scope.stopsJob.id];
                                }
                                if ($scope.tempDatasets[$scope.tripsJob.id]) {
                                    $scope.setUpTripsDataset($scope.tripsJob.id);
                                    delete $scope.tempDatasets[$scope.tripsJob.id];
                                }

                            } else {
                                $scope.stopsData = data.stops;
                                $scope.tempStopId = $scope.stopsData.id;
                                $scope.tripsData = data.trips;
                                $scope.setMap();
                            }
                            $scope.continue = true;
                        }).catch(function(err) {
                            $('body #map_unavailable').show().html('Map service unavailable');
                        });


                    }
                };

                $scope.utfGridClick = function (e) {
                    if ($scope.viewMode) {
                        // View mode, builds popup html string displaying point image and info
                        var picture = '',
                            popUpHtml = '',
                            queryData = {
                                'query': 'SELECT *, ST_ASGEOJSON(location) as latlon FROM ' +
                                STOP_DATASET + ' WHERE amigo_id=\'' + e.data.amigo_id + '\''
                            }, picData = {
                                'source_amigo_id': e.data.amigo_id
                            };

                        L.amigo.utils.get(SQL_URL, queryData).then(function (pointData) {
                            var point = pointData.data[0],
                                position = JSON.parse(point.latlon).coordinates,
                                trip = point.trip;
                            L.amigo.utils.get(RELATED_TABLE_ENTRIES_URL, picData).then(function (data) {
                                var zoom = RELATED_TABLE_URL + e.data.amigo_id + '/' + encodeURIComponent(data.data[0].filename) + '?token=' + $scope.readToken;
                                picture = zoom + '&medium';
                                apiService.GET(API_ROOT + 'trip-video?trip=' + trip).then(function (vidData) {
                                    var isAvailable = false;
                                    isAvailable = vidData.status === 'AV';
                                    popUpHtml = '<div><h3 class="popover-title">' + $scope.translation.ENTRY_DETAILS + '</h3>' +
                                        '<div class="popover-content">' +
                                        '<div class="image-container">' +
                                        '<div class="image">' +
                                        (isAvailable ? '<button class="btn btn-default btn-zoom btn-video" ng-click="openVideo(\'' + trip + '\')"><i class="fa fa-play"></i></button>' :
                                            '<button class="btn btn-default btn-zoom btn-video video-disabled" title="Video not available for this trip."><i class="fa fa-play"></i></button>') +
                                        '<a href="' + zoom + '" target="_blank" class="btn btn-default btn-zoom"><i class="fa fa-search-plus"></i></a>' +
                                        '<div class="image-bg rotate' + point.orientation + '" style="background: url(' + picture + ') no-repeat"></div>' +
                                        '</div>' +
                                        '<div class="date"><span class="pull-left">' + moment.utc(point.date).local().format("MM/DD/YY") +
                                        '</span><span class="pull-right">' + moment.utc(point.date).local().format("hh:mm A") + '</span></div>' +
                                        '</div>' +
                                        '<div class="description">' +
                                        '<div class="entry"><label>' + $scope.translation.LATITUDE + ':</label><span class="latlon">' + $filter('number')(position[1], 15) + '</span></div>' +
                                        '<div class="entry"><label>' + $scope.translation.LONGITUDE + ':</label><span class="latlon">' + $filter('number')(position[0], 15) + '</span></div>' +
                                        '<div class="entry"><label>' + $scope.translation.OBJECT_TYPE + ':</label><span>' + (point.object_type ? $scope.translation[point.object_type] : $scope.translation.NONE) + '</span></div>' +
                                        '<div class="entry"><label>' + $scope.translation.DESCRIPTION + ':</label><span>' + (point.description ? point.description : $scope.translation.NONE) + '</span></div>' +
                                        '</div>' +
                                        '</div></div>';
                                    var linkFunction = $compile(angular.element(popUpHtml)),
                                        newScope = $scope.$new();

                                    var popup = L.popup()
                                        .setLatLng([position[1], position[0]])
                                        .setContent(linkFunction(newScope)[0])
                                        .openOn($scope.map);
                                });
                            });
                        });

                        apiService.GET($rootScope.apiRoot.trip_images, {
                            stop: e.data.amigo_id,
                            only_boat: true
                        }).then(function (data) {
                            var lastBoat = $scope.currentBoat;
                            $scope.currentBoat = data.boat;

                            if (lastBoat !== $scope.currentBoat) {
                                if ($scope.infoPanel) {
                                    $scope.infoPanel.removeFrom($scope.map);
                                }

                                // Displaying Info Panel on finished loading images
                                $scope.infoPanel = L.control.infopanel({
                                    data: $scope.boatData,
                                    marker: $scope.currentBoat,
                                    labelsMap: LABELS_MAP,
                                    translation: $scope.translation
                                }).addTo($scope.map);
                            }
                        });
                    } else {
                        // Loads selected point info into stop editor and the rest of the images for easy access
                        if ($scope.tripPictures.length && $scope.sendLocationIndex(e)) {
                            return;
                        }

                        $scope.tripPictures = [];
                        if ($scope.infoPanel) {
                            $scope.infoPanel.removeFrom($scope.map);
                        }

                        $scope.$emit('event:loadingImages', {value: true});
                        apiService.GET($rootScope.apiRoot.trip_images, {
                            stop: e.data.amigo_id
                        }).then(function (data) {
                            $scope.currentBoat = data.boat;
                            $scope.tripPictures = data.data;
                            $scope.$emit('event:loadingImages', {value: false});

                            // Displaying Info Panel on finished loading images
                            $scope.infoPanel = L.control.infopanel({
                                data: $scope.boatData,
                                marker: $scope.currentBoat,
                                labelsMap: LABELS_MAP,
                                translation: $scope.translation
                            }).addTo($scope.map);

                            $timeout(function () {
                                $scope.sendLocationIndex(e);
                            }, 0)
                        });
                    }
                };

                $scope.sendLocationIndex = function (e) {
                    for (var i = 0; i < $scope.tripPictures.length; i++) {
                        if (e.data.amigo_id === $scope.tripPictures[i].amigo_id) {
                            $scope.$emit('event:pointClick', {
                                idx: e.data.amigo_id
                            });
                            return true;
                        }
                    }
                    return false;
                };

                $scope.highlight = function (amigoId) {
                    for (var i = 0; i < $scope.tripPictures.length; i++) {
                        if ($scope.tripPictures[i].amigo_id === amigoId) {
                            var coordinates = angular.fromJson($scope.tripPictures[i].latlng).coordinates,
                                position = [coordinates[1], coordinates[0]],
                                currentZoom = $scope.map.getZoom();

                            if (!$scope.marker) {
                                $scope.marker = L.marker(position, {
                                    icon: highlightIcon
                                });
                            } else {
                                $scope.map.removeLayer($scope.marker);
                                $scope.marker.setLatLng(position);
                            }

                            $scope.marker.addTo($scope.map);
                            $scope.map.fitBounds([position], {
                                maxZoom: currentZoom > 18 ? currentZoom : 18
                            });

                            return;
                        }
                    }
                };

                $scope.setMap = function () {
                    var maxHeight = $(window).height(),
                        elem = $('#map');
                    if ($scope.resizeMap) {
                        elem.height(maxHeight - 395);
                    } else {
                        elem.height(maxHeight - 90);
                    }

                    if ($scope.layerArray && $scope.map) {
                        $scope.map.removeLayer($scope.layerArray);
                        $scope.layerArray = null;
                    }

                    var HERE_satelliteDay = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/satellite.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
                        attribution: '&copy; <a href="https://amigocloud.com" target="_blank">AmigoCloud</a> | Map &copy; 1987-2014 <a href="http://developer.here.com" target="_blank">HERE</a>',
                        subdomains: '1234',
                        mapID: 'newest',
                        app_id: HERE_APP_ID,
                        app_code: HERE_APP_CODE,
                        base: 'aerial',
                        maxZoom: 20
                    });

                    var layerArray = [HERE_satelliteDay];

                    if ($scope.tripsData) {
                        var trips = new L.TileLayer(
                            $scope.tripsData.tiles + '/{z}/{x}/{y}.png?c=' + $scope.tripsData.cache_busting + '&token=' + READ_TOKEN,
                            {
                                minZoom: 0,
                                maxZoom: 20,
                                zIndex: 200
                            }
                        );

                        layerArray.push(trips);
                    }

                    if ($scope.stopsData) {
                        $scope.stops = new L.TileLayer(
                            $scope.stopsData.tiles + '/{z}/{x}/{y}.png?c=' + $scope.stopsData.cache_busting + '&token=' + READ_TOKEN,
                            {
                                minZoom: 0,
                                maxZoom: 20,
                                zIndex: 200
                            }
                        );
                        var utfGrid = new L.utfGrid(
                            $scope.stopsData.tiles + '/{z}/{x}/{y}.json?c=' + $scope.stopsData.cache_busting + '&token=' + READ_TOKEN,
                            {
                                useJsonP: false,
                                minZoom: 0,
                                maxZoom: 20
                            }
                        );
                        utfGrid.on('click', function (e) {
                            if (e.data) {
                                $scope.utfGridClick(e);
                            }
                        });

                        layerArray.push($scope.stops);
                        layerArray.push(utfGrid);
                    }

                    $scope.layerArray = L.layerGroup(layerArray);

                    if (!$scope.map) {
                        $scope.map = new L.amigo.map(
                            'map',
                            {
                                center: [39.3134064, -96.7557607],
                                zoom: 3,
                                loadAmigoLayers: false,
                                showAmigoLogo: true
                            }
                        );
                    }

                    $scope.layerArray.addTo($scope.map);

                    if ($scope.stopsData && $scope.stopsData.boundingbox && $scope.updateBoundingBox) {
                        var boundingBox = utilsService.getBoundingBox($scope.stopsData);
                        $scope.map.fitBounds(boundingBox, {maxZoom: 20});
                    }
                    $scope.$emit('event:loadingData', {value: false});
                };

                $scope.setMap();
                $scope.getData();
            }
        ]
    }
});
