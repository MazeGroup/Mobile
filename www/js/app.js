var Mapn = angular.module('MAPN', ['ionic', 'firebase', 'ui.router', 'ngRoute', 'ngCordova', 'ngCordovaOauth', 'ngStorage', 'ngValidate', 'ngCordova', 'ionic-toast'])
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
    // if (localStorage.getItem('AUTH') != null) {

        $stateProvider
            .state('eventmenu', {
                url: "/app",
                abstract: true,
                cache: false,
                templateUrl: "templates/menu.html"
            })
            .state('eventmenu.search', {
                url: "/search",
                controller: "SearchController",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/search.html"
                    }
                }
            })
        // $urlRouterProvider.otherwise("/app/search");

    // } else {

        $stateProvider
            .state('home', {
                url: "/app",
                templateUrl: "templates/login.html"
            })
        $urlRouterProvider.otherwise("/app");
    // }
});

Mapn.factory('FIREBASE_MAZE', function( $firebaseArray ) {
    var config = {
        apiKey: "AIzaSyCa4BK8mag9_ZfiSWkt-nL42cXEv9wSGHs",
        authDomain: "mercurio-15ff2.firebaseapp.com",
        databaseURL: "https://mercurio-15ff2.firebaseio.com",
        projectId: "mercurio-15ff2",
        storageBucket: "mercurio-15ff2.appspot.com",
        messagingSenderId: "1007398979159"
    };
    firebase.initializeApp(config);
    return {
        getCollection: function( collection ) {
            return $firebaseArray((firebase.database().ref(collection)));
        },
        push: function( collection, obj ) {
            return firebase.database().ref(collection).push(obj);
        }
    }

});

/*
 * CONTROLLERS
 */
Mapn.controller('LoginController', function($scope, $http, $cordovaOauth, $ionicHistory, AUTH, $ionicLoading, ionicToast, $window) {
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
    // $ionicLoading.hide(); 

    $scope.makeLogin = function(form) {
        var data = $("#loginForm").serializeArray().reduce(function(a, x) {
                a[x.name] = x.value;
                return a;
            }, {}); 
        $ionicLoading.show({
            template: TEMPLATE_LOADING
        });
        AUTH.store( data );
        $ionicLoading.hide(); 
        return window.location.href = '#/app/search';
        return 	$window.location.reload(true);
    }

});



Mapn.controller('HomeController', function($scope, $http, AUTH, $ionicLoading, ionicToast, $firebaseArray) {

});

Mapn.controller('SearchController', function($scope, $http, AUTH, $ionicLoading, ionicToast, $ionicPopup, FIREBASE_MAZE) {
    $scope.ResponseData = FIREBASE_MAZE.getCollection('products');

    $scope.addFavorite = function( id ) {
        FIREBASE_MAZE.push();
        ionicToast.show(' Filiado  ', 'bottom', false, 5000);
    } 

    $scope.addProduct = function() {
        $scope.data = {
            "commission" : 10,
            "description" : "Descrição",
            "image" : "https://firebasestorage.googleapis.com/v0/b/mercurio-15ff2.appspot.com/o/smart.png?alt=media&token=eccbd1d7-78d7-4ad5-bf8f-ef8a0c81ceda",
            "name" : "EXAMPLE",
            "price" : 1300,
            "title" : ""
        };
        var myPopup = $ionicPopup.show({
            template: 'Nome<input type="title" ng-model="data.title" placehodler="Nome"><br>Preço<input type="price" ng-model="data.price" placehodler="Nome"><br>Comissão<input type="commission" ng-model="data.commission" placehodler="Comissão"><br>Descrição<textarea ng-model="data.description"></textarea>',
            title: 'Adicionar produto',
            scope: $scope,
            buttons: [{
                text: 'Cancelar'
            }, {
                text: '<b>Salvar</b>',
                type: 'button-positive',
                onTap: function(e) {
                    return FIREBASE_MAZE.push( 'products', $scope.data)
                }
            }, ]
        });
    }    
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
            if (this.isAuthenticated()) return window.location.replace('/#/app');
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
        $ionicLoading.hide();
        return window.location.replace('/#/app');
        // return window.location.reload();
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