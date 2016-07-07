'use strict';
angular.module('shellcatchApp.directives').
directive('imageRoll', function () {
        return {
            scope: {
                tripPictures: '=',
                tripEnabled: '=',
                tripName: '='
            },
            templateUrl: 'partials/image-roll.html',
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

                    var maxHeight = $(window).height(),
                        elem = $element.find('.panel-body');
                    elem.height(maxHeight - 224);
                    elem.css('max-height', maxHeight - 224);

                    $scope.relatedTableUrl = RELATED_TABLE_URL;
                    $scope.readToken       = READ_TOKEN;
                    $scope.loading         = false;
                    $scope.enableDelete    = false;
                    $scope.editTrip        = false;

                    $scope.selectedAll     = false;
                    $scope.defaultOrientation = false;

                    $scope.$on('event:updateSelectedPictures', function (event, data) {
                        for (var i = 0; i < $scope.tripPictures.length; i++) {
                            if ($scope.tripPictures[i].amigo_id === data.amigoId) {
                                $scope.tripPictures[i].selected = !$scope.tripPictures[i].selected;
                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                    $scope.$apply();
                                }
                                return;
                            }
                        }
                    });

                    $scope.$on('event:updateTripImagesContainer', function () {
                        $timeout(function () {
                            $(window).resize();
                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$apply();
                            }
                        }, 0);
                    });

                    $scope.$on('event:update-loading-data', function (event, data) {
                        $scope.loading = data.value;
                    });

                    $scope.$on('event:clear-trip-editor-view', function () {
                        $scope.tripEnabled = null;
                    });

                    $scope.$on('event:boatOrientation', function (event, data) {
                        $scope.defaultOrientation = false;
                        if (data != -1) {
                            $scope.defaultOrientation = true;
                        }
                    });

                    $scope.$on('event:set-trip', function (event, data) {
                        if (data) {
                            $scope.tripEnabled = true;
                        }
                        $scope.$emit('event:is_enabled');
                    });

                    $scope.$watch('tripPictures', function (newValue, oldValue) {
                        if (newValue !== oldValue && newValue !== null) {
                            for (var i = 0; i < newValue.length; i++) {
                                if (newValue[i].selected && !newValue[i].deleted) {
                                    $scope.enableDelete = true;
                                    return;
                                }
                            }
                            $scope.enableDelete = false;
                        }
                    }, true);

                    $scope.save = function () {
                        $scope.$emit('event:displayConfirmModal', 
                            $scope.selectedAll
                        );
                    };

                    $scope.autoSave = function () {
                        $scope.checkAll();
                        $scope.tripEnabled = 1;
                        $scope.$emit('event:displayAutoConfirmModal', {
                            trip: $scope.tripPictures,                        
                        });
                    };

                    $scope.deleteTrip = function () {
                        $scope.$emit('event:displayDeleteConfirmModal', {
                            trip: $scope.tripPictures
                        });
                    };

                    $scope.selectOption = function (val) {
                        $scope.tripEnabled = val;
                    };

                    $scope.deleteSelected = function () {
                        for (var i = 0; i < $scope.tripPictures.length; i++) {
                            if ($scope.tripPictures[i].selected) {
                                $scope.tripPictures[i].deleted = true;
                            }
                        }
                        $scope.$emit('event:updateMapLayers');
                        $(window).resize();
                    };

                    $scope.rotateRight = function (picture) {
                        picture.orientation += 90;
                        picture.modified = true;
                    };

                    $scope.rotateLeft = function (picture) {
                        picture.orientation -= 90;
                        picture.modified = true;
                    };

                    $scope.rotateLeftAll = function () {
                        angular.forEach($scope.tripPictures, function (picture) {
                            picture.orientation -= 90;
                            picture.modified = true;
                        });
                    };

                    $scope.rotateRightAll = function () {
                        angular.forEach($scope.tripPictures, function (picture) {
                            picture.orientation += 90;
                            picture.modified = true;
                        });
                    };

                    $scope.getPreview = function (picture) {
                        var str = '' + picture.orientation,
                            transform = [
                                '-webkit-transform',
                                '-moz-transform',
                                '-ms-transform',
                                '-o-transform',
                                'transform',
                                ''
                            ];

                        return transform.join(': rotate(' + str + 'deg);');
                    };

                    $scope.checkAll = function () {
                        if ($scope.selectedAll) {
                            $scope.selectedAll = false;
                        } else {
                            $scope.selectedAll = true;
                        }
                        angular.forEach($scope.tripPictures, function (picture) {
                            picture.selected = $scope.selectedAll;
                        });

                    };
                }
            ]
        }
    });