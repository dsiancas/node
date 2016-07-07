'use strict';
angular.module('shellcatchApp.directives').
directive('editMap', function () {
        return {
            scope: {
                selectedTrip: '=',
                tripData: '='
            },
            templateUrl: 'partials/map.html',
            controller: [
                '$rootScope', '$scope', '$element', '$filter', '$timeout',
                'apiService', 'utilsService', 'SET_UP_DATASET',
                'COLOR_PALETTE_COUNT', 'READ_TOKEN', 'RELATED_TABLE_URL',
                'RELATED_TABLE_ENTRIES_URL', 'HERE_APP_ID', 'HERE_APP_CODE',
                'LABELS_MAP', 'SQL_URL', 'STOP_DATASET',
                function ($rootScope, $scope, $element, $filter, $timeout,
                          apiService, utilsService, SET_UP_DATASET,
                          COLOR_PALETTE_COUNT, READ_TOKEN, RELATED_TABLE_URL,
                          RELATED_TABLE_ENTRIES_URL, HERE_APP_ID, HERE_APP_CODE,
                          LABELS_MAP, SQL_URL,STOP_DATASET) {

                    var highlightIcon = L.icon({
                        iconUrl:       "../static/img/marker-icon.png",
                        iconRetinaUrl: "../static/img/marker-icon-2x.png",
                        shadowUrl:     "../static/img/marker-shadow.png",
                        iconSize:      [25, 41],
                        iconAnchor:    [12, 41],
                        popupAnchor:   [1, -34],
                        shadowSize:    [41, 41]
                    });

                    $scope.layerArray        = null;
                    $scope.readToken         = READ_TOKEN;
                    $scope.tempDatasets      = {};
                    $scope.updateBoundingBox = true;
                    $scope.markers           = new L.FeatureGroup();
                    $scope.highlights        = new L.FeatureGroup();
                    $scope.paths             = new L.FeatureGroup();
                    $scope.loadingData       = false;
                    $scope.readToken         = READ_TOKEN;

                    if ($rootScope.selectedLanguage === 'en') {
                        $scope.translation = translationsEN;
                    } else {
                        $scope.translation = translationsES;
                    }

                    $rootScope.$watch('selectedLanguage', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            if (newValue === 'en') {
                                $scope.translation = translationsEN;
                            } else {
                                $scope.translation = translationsES;
                            }
                        }
                    });

                    $scope.$watch('selectedTrip', function (newValue, oldValue) {
                        if (newValue && typeof newValue !== 'undefined' && newValue.length) {
                            $scope.tripString = newValue;
                            $scope.updateBoundingBox = true;
                            $scope.getData();
                        }
                    }, true);

                    $scope.$watch('tripData', function (newValue, oldValue) {
                        if ($scope.updateHighlights && newValue && newValue.length) {
                            $scope.checkHighlights();
                        }
                    }, true);

                    $scope.$on('$destroy', function () {
                        $('#map').height(0);
                        if ($scope.map) {
                            $scope.map.remove();
                        }
                    });

                    $scope.$on('event:updateMap', function () {
                        $scope.updateBoundingBox = false;
                        $scope.setMap();
                    });

                    $scope.$on('event:clear-trip-editor-view', function () {
                        $scope.tripData = null;
                        $scope.selectedTrip = null;
                        $scope.setMap();
                    });

                    $scope.checkHighlights = function () {
                        var highlightIcon = L.icon({
                            iconUrl:       "../static/img/marker-icon.png",
                            iconRetinaUrl: "../static/img/marker-icon-2x.png",
                            shadowUrl:     "../static/img/marker-shadow.png",
                            iconSize:      [25, 41],
                            iconAnchor:    [12, 41],
                            popupAnchor:   [1, -34],
                            shadowSize:    [41, 41]
                        });

                        $scope.layerArray.removeLayer($scope.highlights);
                        $scope.highlights.clearLayers();

                        for (var i = 0; i < $scope.tripData.length; i++) {
                            var point = $scope.tripData[i],
                                coordinates = angular.fromJson(point.latlng).coordinates,
                                position    = [coordinates[1], coordinates[0]];

                            if ($scope.tripData[i].selected && !$scope.tripData[i].deleted) {
                                var highIcon = L.marker(position, {
                                    icon: highlightIcon,
                                    amigoId: point.amigo_id
                                });

                                highIcon.on('click', function (e) {
                                    $scope.$emit('event:editTripPointClick', {
                                        amigoId: e.target.options.amigoId
                                    });
                                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                        $scope.$apply();
                                    }
                                });

                                $scope.highlights.addLayer(highIcon);
                            }
                        }

                        $scope.layerArray.addLayer($scope.highlights);

                        if ($scope.updateBoundingBox) {
                            if ($scope.highlights.getLayers().length) {
                                $scope.map.fitBounds($scope.highlights, {maxZoom: 20});
                            } else {
                                $scope.map.fitBounds($scope.markers, {maxZoom: 18});
                            }
                        }
                    };

                    $scope.getData = function () {
                        if (typeof $scope.tripString !== 'undefined') {
                            $scope.loadingData = true;
                            $scope.$emit('event:trip-editor-loading-data', {value: true});
                            $scope.tripData = null;
                            apiService.GET($rootScope.apiRoot.trip_images, {
                                trip: $scope.tripString
                            }).then(function (data) {
                                if(data.data.length){
                                    $scope.updateHighlights = false;
                                    $scope.currentBoat = data.boat;
                                    $scope.tripData = $scope.fixData(data.data);
                                    $scope.setMap();
                                    $scope.$emit('event:tripImagesLoaded');
                                    $scope.$emit('event:trip-editor-loading-data', {value: false});
                                    $scope.loadingData = false;
                                }
                                else{
                                    $scope.$emit('event:tripImagesLoaded');
                                    $scope.$emit('event:trip-editor-loading-data', {value: false});
                                    $scope.$emit('event:no-trip-data');
                                    $scope.loadingData = false;
                                }
                            }).catch(function(err) {
                                $scope.getData();
                            });
                        }
                    };

                    // function to build and fix picture url
                    $scope.fixData = function (data) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].picture = RELATED_TABLE_URL + data[i].amigo_id +
                                '/' + encodeURIComponent(data[i].picture);
                        }

                        return data;
                    }

                    $scope.getIcon = function (point) {
                        point = typeof point !== 'undefined' ? point : null;

                        if (point && point.object_type === 'turtle') {
                            return new L.divIcon({
                                className: '',
                                html:      '<div class="regular-marker-red" style="background:#F7464A"></div>'
                            });
                        } else {
                            return new L.divIcon({
                                className: '',
                                html:      '<div class="regular-marker" style="background:' +
                                    '#C1C1C1' + '"></div>'
                            });
                        }
                    };

                    $scope.setMap = function () {
                        var maxHeight = $(window).height(),
                            elem = $('#map');
                        elem.height(maxHeight - 125);

                        if ($scope.layerArray && $scope.map) {
                            $scope.map.removeLayer($scope.layerArray);
                            $scope.markers.clearLayers();
                            $scope.paths.clearLayers();
                            $scope.highlights.clearLayers();
                            $scope.layerArray = null;
                        }

                        var HERE_satelliteDay = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/satellite.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
                            attribution: '&copy; <a href="https://amigocloud.com" target="_blank">AmigoCloud</a> | Map &copy; 1987-2014 <a href="http://developer.here.com" target="_blank">HERE</a>',
                            subdomains:  '1234',
                            mapID:       'newest',
                            app_id:      HERE_APP_ID,
                            app_code:    HERE_APP_CODE,
                            base:        'aerial',
                            maxZoom:     20
                        });

                        var layerArray = [HERE_satelliteDay];

                        if ($scope.tripData) {
                            var pointsArray = [];

                            for (var i = 0; i < $scope.tripData.length; i++) {
                                if (!$scope.tripData[i].deleted) {
                                    var point = $scope.tripData[i],
                                        coordinates = angular.fromJson(point.latlng).coordinates,
                                        position    = [coordinates[1], coordinates[0]],
                                        normalIcon  = $scope.getIcon($scope.tripData[i]),
                                        marker      = L.marker(position, {
                                            icon: normalIcon,
                                            amigoId: point.amigo_id
                                        });

                                    marker.on('click', function (e) {
                                        $scope.$emit('event:editTripPointClick', {
                                            amigoId: e.target.options.amigoId
                                        });
                                        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                            $scope.$apply();
                                        }
                                    });

                                    $scope.markers.addLayer(marker);
                                    pointsArray.push(position);
                                }
                            }

                            var path = L.polyline(pointsArray, {
                                color:     '#C1C1C1',
                                opacity:   1,
                                clickable: false,
                                weight:    3
                            });

                            $scope.paths.addLayer(path);
                            // Comented this to remove line patterns which is causing poor performance
                            // path.setText('   \u25BA   ', {repeat: true,
                            //   offset: 4,
                            //   attributes: {fill: '#C1C1C1'}});

                            layerArray.push($scope.paths);
                            layerArray.push($scope.markers);
                            layerArray.push($scope.highlights);
                            if ($scope.updateBoundingBox) {
                                $scope.map.fitBounds($scope.markers, {maxZoom: 18});
                            }
                        }

                        $scope.layerArray = L.layerGroup(layerArray);

                        if (!$scope.map) {
                            $scope.map = new L.amigo.map(
                                'map',
                                {
                                    center:             [39.3134064, -96.7557607],
                                    zoom:               3,
                                    loadAmigoLayers:    false,
                                    showAmigoLogo:      true
                                }
                            );
                        }

                        $scope.layerArray.addTo($scope.map);

                        $scope.$emit('event:loadingData', {value: false});
                        $scope.updateHighlights = true;
                        $scope.updateBoundingBox = true;
                    };

                    $scope.setMap();
                }
            ]
        }
    });
