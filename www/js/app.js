var Mapn = angular.module('MAPN', ['ionic', 'ui.router', 'ngRoute', 'ngCordova', 'ngCordovaOauth', 'ngStorage', 'ngValidate', 'ngCordova', 'ionic-toast'])
var Mapn_API_URL = "http://54.200.176.218";
var TEMPLATE_LOADING = '<ion-spinner icon="spiral"></ion-spinner>';

Mapn.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})
Mapn.filter('myDateFormat', function myDateFormat($filter) {
    return function(text) {
        var tempdate = new Date(text.replace(/-/g, "/"));
        return $filter('date')(tempdate, "dd/MM/yyyy HH:mm");
    }
});
Mapn.config(function($validatorProvider, $stateProvider, $urlRouterProvider, $routeProvider, $ionicConfigProvider, $locationProvider) {
    $validatorProvider.setDefaults({
        errorPlacement: function(error, element) {}
    });
    if (localStorage.getItem('AUTH') != null) {

        $stateProvider
            .state('eventmenu', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html"
            })
            .state('eventmenu.home', {
                url: "/index",
                controller: "HomeController",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html"
                    }
                }
            })
            .state('eventmenu.place', {
                url: "/local/:local",
                cache: false,
                controller: "LocalController",
                views: {
                    'menuContent': {
                        templateUrl: "templates/local.html"
                    }
                }
            })
            .state('sharePhoto', {
                url: "/sharePhoto",
                controller: "SharePhotoController",
                templateUrl: "templates/sharePhoto.html"
            })
            .state('eventmenu.profile', {
                url: "/profile",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html"
                    }
                }
            })
        $urlRouterProvider.otherwise("/app/index");

    } else {

        $stateProvider
            .state('eventmenu', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html"
            })
            .state('eventmenu.home', {
                url: "/index",
                views: {
                    'menuContent': {
                        templateUrl: "templates/login.html"
                    }
                }
            })
            .state('eventmenu.register', {
                url: "/register",
                controller: 'RegisterController',
                views: {
                    'menuContent': {
                        templateUrl: "templates/register.html"
                    }
                }
            })
        $urlRouterProvider.otherwise("/app");
    }
});
Mapn.factory('Camera', function($q) {

    return {
        getPicture: function(options) {
            var q = $q.defer();

            navigator.camera.getPicture(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }

});

Mapn.service('GeoService', function($ionicPlatform, $cordovaGeolocation, ionicToast) {
    return {
        getPosition: function() {
            
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation
        .getCurrentPosition(posOptions).then(function (position) {
            return localStorage.setItem('MyLocation', JSON.stringify(position.coords));
        }, function(err) {
            localStorage.setItem('MyLocation', JSON.stringify({
                latitude: "-23.5711068",
                longitude: "-46.6499716"
            }));
            return ionicToast.show("Sem localização", 'bottom', false, 5000);
        });
        }
    };

});

/*
 * CONTROLLERS
 */
Mapn.controller('IndexController', function($scope, $http, $cordovaOauth, $ionicHistory, AUTH, $ionicLoading, ionicToast) {
    $scope.validationOptions = {
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 4
            }
        },
        messages: {
            email: {
                required: "Informe seu e-mail",
                email: "Email invalido"
            },
            password: {
                required: "Informe sua senha",
                minlength: "Sua senha deve ter no minimo 4 caracteres"
            }
        }
    }

    $scope.makeLogin = function(form) {

        if (form.validate()) {
            var data = $("#loginForm").serializeArray().reduce(function(a, x) {
                a[x.name] = x.value;
                return a;
            }, {});

            $http({
                method: 'POST',
                data: {
                    email: data.email,
                    password: data.password
                },
                url: Mapn_API_URL + "/auth/login",
            }).then(function successCallback(response) {
                AUTH.store(response.data);
                return window.location.reload();
            }, function errorCallback(response) {
                ionicToast.show(response.data.error.message, 'bottom', false, 5000);
            });
        }
    }

});
Mapn.controller('SocialAuthController', function($scope, $http, $cordovaOauth, $ionicHistory, AUTH, $ionicLoading) {

    $scope.LoginwithFacebook = function() {

        $cordovaOauth.facebook("{FACEBOOK_ID}", ['email', 'publish_actions']).then(function(result) {
            $http({
                method: 'GET',
                url: "https://graph.facebook.com/me?fields=id,name,email,link,picture.type(large)&access_token=" + result.access_token,
            }).then(function successCallback(response) {
                $http({
                    method: 'POST',
                    data: {
                        facebook_id: response.data.id,
                        name: response.data.name,
                        photo: response.data.picture.data.url,
                        facebook_token: result.access_token,
                        facebook_link: response.data.link,
                        email: response.data.email,
                    },
                    url: Mapn_API_URL + "/auth/facebook",
                }).then(function successCallback(response) {
                    $ionicLoading.show({
                        template: TEMPLATE_LOADING
                    });
                    AUTH.store(response.data);
                    return window.location.reload();
                }, function errorCallback(response) {});
            }, function errorCallback(response) {});
        });
    };

});
Mapn.controller('RegisterController', ['$scope', '$http', 'AUTH', '$ionicLoading', '$state', 'ionicToast', function($scope, $http, AUTH, $ionicLoading, $state, ionicToast) {
    $scope.validationOptions = {
        rules: {
            email: {
                required: true,
                email: true
            },
            name: {
                required: true,
            },
            password: {
                required: true,
                minlength: 4
            }
        },
        messages: {
            email: {
                required: "Informe seu e-mail",
                email: "Email invalido"
            },
            name: {
                required: "Informe seu nome",
            },
            password: {
                required: "Informe sua senha",
                minlength: "Sua senha deve ter no minimo 4 caracteres"
            }
        }
    }

    $scope.makeRegister = function(form) {
        if (form.validate()) {
            $ionicLoading.show({
                template: TEMPLATE_LOADING
            });
            var data = $("#registerForm").serializeArray().reduce(function(a, x) {
                a[x.name] = x.value;
                return a;
            }, {});
            $http({
                method: 'POST',
                data: {
                    email: data.email,
                    name: data.name,
                    password: data.password
                },
                url: Mapn_API_URL + "/auth/register",
            }).then(function successCallback(response) {
                AUTH.store(response.data);
                $ionicLoading.hide();
                return window.location.reload();
            }, function errorCallback(response) {
                $ionicLoading.hide();
                ionicToast.show(response.data.error.message, 'bottom', false, 5000);
            });
        }
    }

}]);
Mapn.service('AUTH', [function($scope, $localStorage, $sessionStorage) {
    return {
        isAuthenticated: function() {
            return !(localStorage.getItem('AUTH') == null);
        },
        get: function() {
            return (this.isAuthenticated()) ? JSON.parse(localStorage.getItem('AUTH')) : {};
        },
        store: function(data) {
            return localStorage.setItem('AUTH', JSON.stringify(data));
        },
        loading: function(data) {
            return localStorage.setItem('AUTH', JSON.stringify(data));
        },
        logout: function(data) {
            return localStorage.removeItem("AUTH");
        },
        ban: function() {
            if (this.isAuthenticated()) return window.location.replace('/#/home');
            return false;
        }
    };
}]);
Mapn.factory('CameraService', [function($scope, $cordovaCamera) {

    return {
        takeImage: function() {
            document.addEventListener("deviceready", function() {

                var options = {
                    quality: 90,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 600,
                    targetHeight: 600,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: true,
                    correctOrientation: true
                };

                $cordovaCamera.getPidscture(options).then(function(imageData) {
                    localStorage.setItem('LastImg', "data:image/jpeg;base64," + imageData);
                    return window.location.href = '#/sharePhoto';
                }, function(err) {
                    // error
                });
            }, false);

        }
    };

}]);
Mapn.controller('AplicationController', ['$scope', 'AUTH', '$ionicLoading', function($scope, AUTH, $ionicLoading) {
    $scope.isAuth = function() {
        return AUTH.isAuthenticated();
    }
    $scope.User = AUTH.get();
    $scope.logout = function() {
        $ionicLoading.show({
            template: TEMPLATE_LOADING
        });
        AUTH.logout();
        return window.location.reload();
    }
    $scope.searchPlace = function(value) {
        // if( value.length < 3)
        //    console.log( value.length );
        //    if( )
    }
}]);
Mapn.controller('AboutController', ['$scope', 'AUTH', function($scope, AUTH) {

    $scope.options = {
        // loop: true,
        effect: 'fade',
        speed: 500,
    }

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data) {
        // data.slider is the instance of Swiper
        $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function(event, data) {
        console.log('Slide change is beginning');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data) {
        // note: the indexes are 0-based
        $scope.activeIndex = data.slider.activeIndex;
        $scope.previousIndex = data.slider.previousIndex;
    });

}]);
Mapn.controller('TesteController', ['$scope', 'AUTH', function($scope, AUTH) {
    console.log(" TesteController")
}]);
Mapn.controller('HomeController', ['$scope', '$http', 'AUTH', '$ionicPlatform', '$cordovaGeolocation', 'GeoService', '$ionicLoading', '$ionicModal', 'ionicToast', function($scope, $http, AUTH, $ionicPlatform, $cordovaGeolocation, GeoService, $ionicLoading, $ionicModal, ionicToast) {
    $ionicPlatform.ready(function() {  
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
        });
        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            localStorage.setItem('MyLocation', JSON.stringify(position.coords));
            $ionicLoading.hide();           
             
        }, function(err) {
            $ionicLoading.hide();
        });
    });
    $scope.TESTE = JSON.parse(localStorage.getItem('MyLocation'));
    $scope.CHANGE = function() {
        $scope.getLocals($scope.distanceVal);
    }
    $scope.getLocals = function(distance) {
        var LAT = ( !isEmpty($scope.TESTE.latitude) ) ? $scope.TESTE.latitude : "-23.5711068";
        var LOT = ( !isEmpty($scope.TESTE.longitude) ) ? $scope.TESTE.longitude : "-46.6499716";
        localStorage.setItem('DISTANCE', distance);
        $ionicLoading.show({
            template: TEMPLATE_LOADING
        });
        var Mapn_API_URL_LOCATION = Mapn_API_URL + "/places/user/" + AUTH.get()._id + "/" + LAT + "/" + LOT + "/" + distance + "/100";
        $http({
            method: 'get',
            url: Mapn_API_URL_LOCATION,
        }).then(function successCallback(response) {
            $scope.ResponseData = response.data;
            $ionicLoading.hide();
            return true;
        }, function errorCallback(response) {
            $ionicLoading.hide();
        });
    }
    $scope.getLocals(90);
    $scope.favorite = function(id) {
        $ionicLoading.show({
            template: TEMPLATE_LOADING
        });
        $http({
            method: 'POST',
            data: {
                place_id: id,
                user_id: AUTH.get()._id,
            },
            url: Mapn_API_URL + "/places/favorite",
        }).then(function successCallback(response) {
            $scope.getLocals(localStorage.getItem('DISTANCE'));
            ionicToast.show('Favoritado', 'bottom', false, 5000);
        }, function errorCallback(response) {});
    }
}]);
Mapn.controller('LocalController', ['$scope', '$http', '$stateParams', 'AUTH', '$ionicLoading', '$ionicPopup', '$rootScope', 'ionicToast', function($scope, $http, $stateParams, AUTH, $ionicLoading, $ionicPopup, $rootScope, ionicToast) {
    $scope.orderByFunction = function(friend) {
        return parseInt(friend.pointing);
    };
    if (!($rootScope.tab)) $rootScope.tab = 'details';

    $scope.getLocal = function() {
        $ionicLoading.show({
            template: TEMPLATE_LOADING
        });
        console.log( Mapn_API_URL + "/places/" + $stateParams.local + "/user/" + AUTH.get()._id );
        $http({
            method: 'get',
            url: Mapn_API_URL + "/places/" + $stateParams.local + "/user/" + AUTH.get()._id,
        }).then(function successCallback(response) {
            $scope.ResponseData = response.data;
            loadMap(response.data.location.latitude, response.data.location.longitude, "#googleMap");
            $ionicLoading.hide();
            return true;
        }, function errorCallback(response) {});
    }
    $scope.getLocal();
    localStorage.setItem('checkIn', $stateParams.local);
    $scope.local = $stateParams.local;
    $scope.place_id = $stateParams.local;
    $scope.TESTE = function() {
        $ionicPopup.show({
            cssClass: 'popup-vertical-buttons',
            template: "Escolha uma das ações",
            title: 'Eu quero',
            scope: $scope,
            buttons: [{
                text: '<b>Fazer checkIn</b>',
                type: 'button-positive',
                onTap: function() {
                    $scope.insertCheckIn();
                }
            }, {
                text: '<b>Dar feedback</b>',
                type: 'button-positive',
                onTap: function() {
                    if (!$scope.ResponseData.FeedbacksUser) return $scope.insertFeedback();
                }
            }, {
                text: 'Cancelar'
            }, ]
        });
    }
    $scope.modalItem = function(item, name, point) {
        $scope.data = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="password" ng-model="data.wifi">',
            title: 'Resgatar Item',
            subTitle: 'Por favor, informe o código',
            scope: $scope,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: '<b>Resgatar</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.wifi) {
                        e.preventDefault();
                    } else {
                        if ($scope.ResponseData.code != $scope.data.wifi) return e.preventDefault();
                        $http({
                            method: 'POST',
                            data: {
                                item_id: item,
                                place_id: $stateParams.local,
                                point: point,
                            },
                            url: Mapn_API_URL + "/user/" + AUTH.get()._id + "/item",
                        }).then(function successCallback(response) {
                            ionicToast.show('Recompensa resgatada! :D', 'bottom', false, 5000);
                            return window.location.href = '#/app/profile';
                        }, function errorCallback(response) {
                            console.log(response.data);
                        });

                    }
                }
            }, ]
        });

    }

    $scope.modalItemHide = function() {
        $scope.ModalItem.hide();
    }

    $scope.insertCheckIn = function() {
        $scope.data = {}
        var myPopup = $ionicPopup.show({
            template: '<input type="password" ng-model="data.wifi">',
            title: ' Faça o CheckIn',
            subTitle: 'Por favor, informe o código',
            scope: $scope,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: '<b>Salvar</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.wifi) {
                        e.preventDefault();
                    } else {
                        if ($scope.ResponseData.code != $scope.data.wifi) return e.preventDefault();
                        $http({
                            method: 'POST',
                            data: {
                                "checkIn": $stateParams.local,
                                "user_id": AUTH.get()._id,
                                "point": "1",
                                "code": $scope.data.wifi
                            },
                            url: Mapn_API_URL + "/checkin",
                        }).then(function successCallback(response) {
                            $scope.getLocal();
                            $rootScope.tab = 'items';
                            ionicToast.show('CheckIn realizado! ;)', 'bottom', false, 5000);
                        }, function errorCallback(response) {
                            return e.preventDefault();
                        });
                    }
                }
            }, ]
        });
    };

    $scope.insertFeedback = function() {
        $scope.data = {};
        $ionicPopup.show({
            template: '<textarea placeholder="Texto" ng-model="data.feedback"></textarea>',
            title: ' Faça o feedback',
            subTitle: 'Por favor, descreva o seu feedback',
            scope: $scope,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: '<b>Salvar</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.feedback) {
                        e.preventDefault();
                    } else {
                        $http({
                            method: 'POST',
                            data: {
                                "place_id": $stateParams.local,
                                "user_id": AUTH.get()._id,
                                "name": "POP-UP",
                                "text": $scope.data.feedback
                            },
                            url: Mapn_API_URL + "/feedbacks",
                        }).then(function successCallback(response) {
                            $scope.getLocal();
                            $rootScope.tab = 'feedbacks';
                            ionicToast.show('Feedback criado! ;)', 'bottom', false, 5000);
                        }, function errorCallback(response) {
                            return e.preventDefault();
                        });
                    }
                }
            }, ]
        });
    }

}]);
Mapn.controller('LoginController', ['$scope', 'AUTH', function($scope, AUTH) {
    console.log(AUTH.get());
}])

Mapn.controller('ProfileController', ['$scope', '$http', 'AUTH', '$ionicLoading', function($scope, $http, AUTH, $ionicLoading) {
    $ionicLoading.show({
        template: TEMPLATE_LOADING
    });
    console.log( Mapn_API_URL + "/user/" + AUTH.get()._id );
    $http({
        method: 'get',
        url: Mapn_API_URL + "/user/" + AUTH.get()._id,
    }).then(function successCallback(response) {
        $scope.ResponseData = response.data;
        $ionicLoading.hide();
    }, function errorCallback(response) {});
    $scope.User = AUTH.get();
}])

function isEmpty(str) {
    return (!str || 0 === str.length || str == null);
}

function loadMap(latitude, longitude, divId) {
    new GMaps({
        div: divId,
        lat: latitude,
        lng: longitude
    });
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    var bb = new Blob([ab], {
        "type": mimeString
    });
    return bb;
}

function dataURItoBlob2(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
        type: 'image/png'
    });
}

function mergeObj(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}