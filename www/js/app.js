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
                url: "/home",
                controller: "HomeController",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html"
                    }
                }
            })
        $urlRouterProvider.otherwise("/app/home");

    } else {

        $stateProvider
            .state('home', {
                url: "/app",
                templateUrl: "templates/login.html"
            })
        $urlRouterProvider.otherwise("/app");
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
Mapn.controller('LoginController', function($scope, $http, $cordovaOauth, $ionicHistory, AUTH, $ionicLoading, ionicToast) {
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
        var data = {'email':"user@maze.com", 'password' : "123"}; 
        AUTH.store( data ); 
        return window.location.reload();
    }

});

Mapn.controller('IndexController', function($scope, $http, $cordovaOauth, $ionicHistory, AUTH, $ionicLoading, ionicToast) {

    $scope.teste = function() {
        console.log("TESTE");
    }
    $scope.teste();
});

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