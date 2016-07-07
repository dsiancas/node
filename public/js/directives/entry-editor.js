'use strict';
angular.module('shellcatchApp.directives').directive(
    'entryEditor', ['$interval', '$timeout', function ($interval, $timeout) {
        return {
            scope: {
                entries: '=',
                currentBoat: '=',
                tempStopId: '=',
                currentTrip: '=',
                selectionTrip: "="
            },
            templateUrl: 'partials/imageSlider.html',
            controller: [
                '$scope', '$window', '$element', '$compile', 'READ_TOKEN', 'RELATED_TABLE_URL', '$rootScope', '$location',
                    'apiService',
                function ($scope, $window, $element, $compile, READ_TOKEN, RELATED_TABLE_URL, $rootScope, $location, apiService) {

                    $scope.group = $rootScope.group;

                    $rootScope.$watch('userData', function (newValue, oldValue) {
                        if (newValue) {
                            $scope.current_group = $rootScope.userData.group;
                            show_form_turtle();
                        }
                    });
                    $rootScope.location = $location;
                    $scope.sizePanel = '12';
                    $scope.readToken = READ_TOKEN;
                    $scope.currentIndex = 0;
                    $scope.entries = [];
                    $scope.autoPlay = 100;
                    $scope.autoSlider = false;
                    $scope.disableControls = true;
                    $scope.disableBackward = false;
                    $scope.disableForward = false;
                    $scope.showIcon = false;
                    $scope.Timer = null;
                    $scope.myInterval = 2000;
                    $scope.initial_image = 0;

                    $scope.speed_video = 1000;
                    $scope.speed_video_max = 5;
                    $scope.speed_video_min = 1;
                    $scope.speed_video_initial_per_sec = 1;
                    $scope.total_images = 0;
                    $scope.value = ($scope.initial_image + 1) + "";
                    $scope.time_per_speed = 150;
                    $scope.speed_interval = 1000;
                    $scope.event_loading = false;
                    $scope.showPag = false; 
                    $scope.events = [];
                    $scope.viewby = 5;
                    $scope.totalItems = 6;
                    $scope.currentPage = 1;
                    $scope.itemsPerPage = $scope.viewby;
                    $scope.maxSize = 3; 

                    $scope.setItemsPerPage = function(num) {
                       $scope.itemsPerPage = num;
                       $scope.currentPage = 1;
                    }

                    $scope.options = {       
                        from: $scope.currentIndex + 1,
                        to: $scope.total_images,
                        step: 1,
                        dimension: "",
                        skin: 'round',
                        css: {
                          background: {"background-color": "white"},
                          before: {"background-color": "purple"},
                          pointer: {"background-color": "red"}          
                        }       
                    };

                    $scope.$on('event:updateEvent', function (event) {
                                $scope.showPag = false;
                                $scope.event_loading = true;
                                $scope.sizePanel = '9';
                                $scope.selectionTrip.events = $scope.selectionTrip.events+1
                                $scope.load_events(0);
                    });
                    $scope.$on('event:updateMammal', function (event) {
                                $scope.showPag = false;
                                $scope.event_loading = true;
                                $scope.sizePanel = '9';
                                $scope.selectionTrip.mammals = $scope.selectionTrip.mammals+1
                                $scope.load_events(1);
                    });
                    $scope.$watch('selectionTrip', function(newValue, oldValue) {                        
                        if(newValue) {
                            if ($scope.selectionTrip.events != 0 && !(angular.isUndefined($scope.selectionTrip.events))
                                 && ($scope.current_group === $rootScope.group.coast) ) {
                                $scope.sizePanel = '9';
                                $scope.showPag = false;
                                $scope.event_loading = true;
                                $scope.load_events(0);
                            } else if($scope.selectionTrip.mammals != 0 
                                 && !(angular.isUndefined($scope.selectionTrip.mammals))
                                 && ($scope.current_group === $rootScope.group.turtle)) {
                                $scope.sizePanel = '9';
                                $scope.showPag = false;
                                $scope.event_loading = true;
                                $scope.load_events(1);                                    

                            } else {
                                $scope.event_loading = false;
                                $scope.sizePanel = '12';    
                            }
                        }
                    });

                    $scope.$watch('value',function(){
                        $scope.currentIndex = parseInt($scope.value-1, 10);
                        load_visor_zoom()
                    });

                    $scope.goToEvent = function(current_event){
                        $scope.currentIndex = parseInt(
                            current_event.initial_stop, 10) - 1;
                        load_visor_zoom()
                    };

                    $scope.$watch('entries', function (newValue, oldValue) {
                        if (newValue.length) {
 
                            var noimage = '../static/img/noimage.jpg';
                            $scope.images = [];
                            $scope.disableControls = true;
                            $scope.showIcon = false;
                            $element.find('#load-video .panel-body .bridge .image-slider').remove();
                            for (var i = 0; i < newValue.length; i++) {
                                var zoom = RELATED_TABLE_URL + newValue[i].amigo_id +
                                        '/' + newValue[i].picture + '?token=' + $scope.readToken,
                                    img = zoom + '&medium';
                                var split_current_date = newValue[i].date.split("T");
                                var actual_date = split_current_date[0];
                                var actual_time = split_current_date[1].substr(0, 8);
                                var concat_date = actual_date + " " + actual_time
                                $scope.images.push({
                                    'number_id': i,
                                    'current_trip': newValue[i].trip,
                                    'current_date': concat_date,
                                    'amigoId': newValue[i].amigo_id,
                                    'picture': newValue[i].picture ? img : noimage,
                                    'zoom': newValue[i].picture ? zoom : null,
                                    'number_orientation': newValue[i].orientation,
                                    'orientation': 'rotate' + newValue[i].orientation
                                });
                            }
                            $scope.total_images = i;
                            $scope.options.to = $scope.total_images ;
                            var carousel = '<ul rn-carousel class="image image-slider" \
                                            rn-carousel-controls  \
                                            rn-carousel-buffered \
                                            rn-carousel-index="currentIndex" \
                                            data-index="{{currentIndex}}" \
                                            ng-show="!loadingData" >\
                                              <li ng-repeat="entry in images ">\
                                                <div class="layer">\
                                                    <img ng-src="{{entry.picture}}" data-amigoID="{{entry.amigoId}}" style="max-width:100%" data-current-date="{{entry.current_date}}" class="img-responsive {{entry.orientation}}" data-orientation="{{entry.number_orientation}}" />\
                                                </div>\
                                              </li>\
                                            </ul>';
                            $element.find('.panel-body .bridge').append($compile(carousel)($scope));
                            $scope.disableControls = false;
                            $scope.currentIndex = 0;
                            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                $scope.$digest();
                            }
                        } else {
                            $scope.showIcon = true;
                            $element.find('.image-slider').remove();
                        }
                    });

                    $scope.load_events = function(event_type) {
                        var data = {
                            'trip_id': $scope.currentTrip
                        }
                        var api_query = event_type==0?$rootScope.apiRoot.events: $rootScope.apiRoot.mammals;
                        apiService.GET(api_query, data).
                        then(function (data) {
                            $scope.events  = data;
                            $scope.showPag = true;
                            for (var i=0; i<$scope.events.length; i++) {
                                  $scope.events[i]['pos']= i+1;
                            }
                            $scope.totalItems = $scope.events.length;
                            
                        }, function (data) {
                            $scope.errorEvents   = 'NO_EVENTS';
                        });
                    };
                    var data = {a:1, b:2, c:3};
                    $scope.json = JSON.stringify(data);

                    $scope.downloadGPS = function() {
                        var geo_points = [];
                        for (var i=0; i<$scope.entries.length; i++) {
                            geo_points.push($scope.entries[i]['latlng']);
                        }
                        $scope.amount_gps = geo_points.length;
                        var blob = new Blob([ geo_points ], { type : 'text/plain' });
                        $scope.download_url = (window.URL || window.webkitURL).createObjectURL( blob );
                    }


                    $scope.eventDetail = function(data) {
                        $scope.current_event = data;
                    };

                    $scope.zoomEvent = function(data) {
                        $('#page_chart').hide();
                        $('#page_maps').hide();
                        var image_index = 
                          data.initial_stop+2 >= $scope.entries.length? 
                          $scope.entries.length-1: data.initial_stop+2;
                        var modal = document.getElementById('event-picture-modal');
                        var modalImg = document.getElementById("event-picture");
                        var captionText = document.getElementById("event-description");                        
                        modal.style.display = "block";                        
                        modalImg.src = $scope.images[image_index].zoom;
                        var deg = $scope.images[image_index].number_orientation;
                        $("#event-picture").css({
                            '-webkit-transform': 'rotate(' + deg + 'deg)',   
                            '-moz-transform': 'rotate(' + deg + 'deg)',       
                            '-ms-transform': 'rotate(' + deg + 'deg)',      
                            '-o-transform': 'rotate(' + deg + 'deg)',       
                            'transform': 'rotate(' + deg + 'deg)'            

                        });
                        captionText.innerHTML = data.description;
                    };

                    var event_close = document.getElementsByClassName("event_close")[0];

                    event_close.onclick = function() { 
                        var modal = document.getElementById('event-picture-modal');
                        modal.style.display = "none";
                        $('#page_chart').show();
                        $('#page_maps').show();
                    }

                    $scope.$watch('currentIndex', function (newValue, oldValue) {
                        if ($scope.images && $scope.images.length && $scope.images[newValue]) {

                            $scope.value = $scope.currentIndex+1;
                            $scope.$emit('event:imageChanged', {
                                amigoId: $scope.images[newValue].amigoId
                            });
                        }
                    });

                    $scope.$on('event:imageChange', function (event, data) {
                        if ($scope.images) {
                            for (var i = 0; i < $scope.images.length; i++) {
                                if ($scope.images[i].amigoId === data.idx) {
                                    $scope.currentIndex = i;
                                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                        $scope.$digest();
                                    }
                                }
                            }
                        }
                    });

                    $scope.$on('event:updateStop', function (event, data) {

                        $scope.entries[$scope.currentIndex].object_type = data.data.object_type;
                        $scope.entries[$scope.currentIndex].description = data.data.description;
                    });

                    $scope.$on('event:updateLoadingImages', function (event, data) {
                        $scope.loadingData = data.value;
                    });

                    $scope.toggleNext = function () {
                        if ($scope.currentIndex === $scope.entries.length - 1) {
                            $scope.currentIndex = 0;
                            $scope.togglePause();
                        } else {
                            $scope.currentIndex++;
                        }
                        load_visor_zoom()
                    };
                    
                    $scope.lastImage = function () {
                        $scope.currentIndex = $scope.total_images-1;
                        $scope.togglePause();
                        
                        load_visor_zoom()
                    };

                    $scope.togglePrev = function () {
                        if ($scope.currentIndex === 0) {
                            $scope.currentIndex = $scope.entries.length - 1;
                        } else {
                            $scope.currentIndex--;
                        }
                        load_visor_zoom()
                    };

                    function load_speed_video(left, right) {
                        var new_speed = 1;
                        var div_speed_video = $('#speed_video');
                        var speed_value = parseInt(div_speed_video.attr('data-speed'));
                        var speed_video_conf = $scope.speed_video;
                        if (right) {
                            new_speed = speed_value + 1;
                            if (new_speed > $scope.speed_video_max) {
                                new_speed = $scope.speed_video_max;
                            }
                            if (new_speed == 0) {
                                new_speed = 1;
                            }
                        }
                        if (left) {
                            new_speed = speed_value - 1;
                            if (new_speed < -5) {
                                new_speed = -5;
                            }
                            if (new_speed == 0) {
                                new_speed = -1;
                            }
                        }
                        div_speed_video.attr('data-speed', new_speed);
                        div_speed_video.text('x ' + new_speed);
                        var new_speed_video_config = $scope.speed_interval - (
                            (Math.abs(new_speed)-1)* $scope.time_per_speed);
                        $scope.speed_video = new_speed_video_config;
                        return new_speed;
                    }
                    function load_visor_zoom() {
                        var img_src = $('#load-video .panel-body .bridge .image-slider li:eq(4)').find('img').attr('src');
                        $('#load-content-img').find('img').attr('src', img_src);
                        var number_rotate = $('#load-video .panel-body .bridge .image-slider li:eq(4)').find('img').attr('data-orientation');
                        $('#load-content-img').addClass('rotation_' + number_rotate);
                    }
                    $scope.togglePlay = function () {
                        $scope.togglePause();
                        $scope.initial_image = parseInt($('.image-slider').attr('data-index'));
                        $scope.currentIndex = $scope.initial_image;
                        $scope.Timer = $interval(function () {
                            $scope.toggleNext();
                        },  $scope.speed_video);
                    };
                    $scope.togglePause = function () {
                        if (angular.isDefined($scope.Timer)) {
                            $interval.cancel($scope.Timer);
                        }
                        $timeout.cancel($scope.Timer);
                    };
                    $scope.toggleFastForward = function () {
                        $scope.togglePause();
                        $scope.initial_image = parseInt($('.image-slider').attr('data-index'));
                        $scope.currentIndex = $scope.initial_image;
                        var current_speed = load_speed_video(false, true);
                        $scope.Timer = $interval(function () {
                            if (current_speed > 0) {
                                $scope.toggleNext();
                            }
                            else {
                                $scope.togglePrev();
                            }
                        },  $scope.speed_video);                   
                    };
                    $scope.toggleFastBackward = function () {
                        $scope.togglePause();
                        $scope.initial_image = parseInt($('.image-slider').attr('data-index'));
                        $scope.currentIndex = $scope.initial_image;
                        var current_speed = load_speed_video(true, false);
                        $scope.Timer = $interval(function () {
                            if (current_speed > 0) {
                                $scope.toggleNext();
                            }
                            else {
                                $scope.togglePrev();
                            }
                            
                        },  $scope.speed_video);
                    };
                    $scope.toggleRefresh = function () {
                        $scope.togglePause();
                        $scope.currentIndex = 0;
                        $scope.speed_video = $scope.speed_interval;
                        $scope.Timer = $interval(function () {
                            $scope.toggleNext();
                        },  $scope.speed_video);
                    };
                    $scope.toggleZoom = function () {
                        $("#modal-fullscreen").modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                        load_visor_zoom()
                    };
                    $scope.toggleZoomClose = function () {
                        $scope.togglePause();
                        $("#modal-fullscreen").modal('hide');
                    };
                    $scope.$on("$destroy", function () {
                        $scope.togglePause();
                    });
                    function show_form_turtle() {
                        if ($rootScope.location.path() == '/editor') {
                            if ($scope.current_group == $scope.group.coast ){
                                $('#add_form_animal').show();
                                $('#page_chart').hide();
                                $('#page_maps').hide();
                             }else{
                                $('#add_form_animal').show();
                                $('#page_chart').show();
                                $('#page_maps').show();
                             }

                            if ($scope.current_group == $scope.group.all){
                                $('#tripPlace').show();
                            } else {
                                $('#tripPlace').hide();
                            }
                        } else if ($rootScope.location.path() == '/viewer') {
                            if ($scope.current_group == $scope.group.coast ){
                                $('#add_form_animal').hide();
                                $('#page_chart').hide();
                                $('#page_maps').hide();
                             }else{
                                $('#add_form_animal').hide();
                                $('#page_chart').show();
                                $('#page_maps').show();
                             }

                            if ($scope.current_group == $scope.group.all){
                                $('#tripPlace').show();
                            } else {
                                $('#tripPlace').hide();
                            }
                        }
                    }
                    $scope.add_count_form = function () {
                        $scope.initial_stop = $scope.value;
                        $scope.initial_image = parseInt($('.image-slider').attr('data-index'));
                        var stop_amigo_id = $scope.images[$scope.initial_image].amigoId;
                        var stop_date = $scope.images[$scope.initial_image].current_date;
                        $('#number_imagen').attr("data-initial", stop_amigo_id);
                        $('#number_imagen').attr("data-date-initial", stop_date);
                        $('#add_form_animal').css({'display': 'none'});
                        $('#save_form_animal').removeAttr('style');
                        $('#reload_form_animal').removeAttr('style');
                    };
                    $scope.open_count_form = function () {
                        $scope.final_image = parseInt($('.image-slider').attr('data-index'));
                        var stop_amigo_id = $scope.images[$scope.final_image].amigoId;
                        var stop_date = $scope.images[$scope.final_image].current_date;
                        $('#number_imagen').attr("data-final", stop_amigo_id);
                        $('#number_imagen').attr("data-date-final", stop_date);
                        $scope.openAddEntryModal();
                        $scope.togglePause();
                    };
                    $scope.reload_count_form = function () {
                        $('#number_imagen').attr("data-initial", "");
                        $('#number_imagen').attr("data-final", "");
                        $('#number_imagen').attr("data-date-initial", "");
                        $('#number_imagen').attr("data-date-final", "");
                        $('#add_form_animal').removeAttr('style');
                        $('#save_form_animal').css({'display': 'none'});
                        $('#reload_form_animal').css({'display': 'none'});
                    };
                    $scope.openAddEntryModal = function () {
                        $scope.$emit('event:openAddEntryModal', {
                            stop: $scope.entries[$scope.currentIndex],
                            boat: $scope.currentBoat,
                            tempStopId: '' + $scope.tempStopId,
                            initial_stop: $scope.initial_stop,
                            parentSc: $scope
                        });
                    };
                }
            ]
        }
    }]);

angular.module('shellcatchApp.directives').directive('stringToNumber', function() {
  return {

    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
            if(/^[1-9][0-9]*$/.test(value)) {
                return '' + value;
            }
            return '' + 1;
            
      });
      ngModel.$formatters.push(function(value) {
            return parseFloat(value, 10);
      });
    }
  };
});