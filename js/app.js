;(function(window, angular) {

  'use strict';

  // Application module
  angular.module('app', ['ui.router', 'app.common'])

  /* Application config */
  .config([
    '$stateProvider', 
    '$urlRouterProvider', 
    function($stateProvider, $urlRouterProvider) {

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: './view/home.html'
        })
        .state('cars', {
          url: '/cars',
          templateUrl: './view/cars.html'
        })
        .state('rent', {
          url: '/rent',
          templateUrl: './view/rent.html',
          controller: 'rentController'
        });
      
      $urlRouterProvider.otherwise('/');
    }
  ])

  // Application run
  .run([
    '$rootScope',
    'trans',
    'http',
    function($rootScope, trans, http) {

      // Transaction events
			trans.events();

      // Set global variables
      $rootScope.user = {id:null, name:null};

      // Get cars
      http.request({
        url: "./php/get_cars.php",
        method: 'POST',
        data: {
          dateNow: moment(moment(), "YYYY-MM-DD").format("YYYY-MM-DD"), 
          valid: 1
        }
      })
      .then(data => {
        $rootScope.cars = data;
        $rootScope.$applyAsync();
      })
      .catch(e => console.log(e));

      // Get carosel images
      http.request("./data/carousel.json")
      .then(data => {
        $rootScope.carousel = data;
        $rootScope.$applyAsync();
      })
      .catch(e => console.log(e));
    }
  ])

  /* Show/Hide password */
	.directive('ngDisplayPassword', [
    () => {
      return {
        restrict: 'EA',
        link: (scope, element, attr) => {
          let skeleton = attr.ngDisplayPassword.trim();
          if (!skeleton.length) skeleton = 'form';
          let parent = element.closest(skeleton);
          if (parent.length) {
            let elements = parent.find('.input-password');
            if (elements.length) {
              element.on('change', () => 
                angular.forEach(elements, (e) => 
                  e.type = e.type === 'password' ? 'text' : 'password'));
            }
          }
				}
			}
		}
	])

  // Rent/Login/Register controller
  .controller('rentController', [
    '$rootScope',
    '$scope',
    '$timeout',
    'util',
    'http',
    function($rootScope, $scope, $timeout, util, http) {

      // Input models
      $scope.model = {
        rent: {
          car_id: null,
          min   : moment().format('YYYY-MM-DD'),
          start : moment().toDate(),
          end   : moment().add(1,'days').toDate()
        },
        login: {
          email   : localStorage.getItem("userEmail"),
          password: ''
        },
        register: {
          name: null,
          gender: null,
          born: null,
          email: null,
          email2: null,
          password: null,
          password2: null,
          max: moment().subtract(18, 'years').format('YYYY-MM-DD'),
        }
      }

      // Check user is logged
      if ($rootScope.user.id)

            // Renails
            http.request({
              url: "./php/renails.php",
              method: 'POST',
              data: {user_id: $rootScope.user.id}
            })
            .then(data => {
              $scope.rentails = data;
              $scope.$applyAsync();
            })
            .catch(e => console.log(e));
      else  $scope.rentails = [];

      // Input changed
      $scope.change = (type) => {
        if (!util.isString(type)) return;
        let btnAccept = document.getElementById(type+'-accept'),
            isBtnOk   = !util.isNull(btnAccept);
        angular.forEach(Object.keys($scope.model[type]), (key) => {
          let element = document.getElementById(type + '-' + key);
          if (element) {
            let isValid = false;
            if (element.hasAttribute('required')) {

              switch(element.type) {
                case 'text':
                case 'email':
                case 'password':
                  if (element.classList.contains('input-email')) {
                    isValid = util.isEmail($scope.model[type][key]);
                    if (isValid) {
                      let parent    = element.closest('form');
                      let elements  = parent.querySelectorAll('.input-email');
                      if (elements.length > 1) {
                        for (let i=0; i < elements.length; i++) {
                          if (!element.isSameNode(elements[i]) && 
                               elements[i].value !== $scope.model[type][key]) {
                            isValid = false;
                            break;
                          }
                        }
                      }
                    }
                  } else if (element.classList.contains('input-password')) {
                    isValid = util.isPassword($scope.model[type][key]);
                    if (isValid) {
                      let parent    = element.closest('form');
                      let elements  = parent.querySelectorAll('.input-password');
                      if (elements.length > 1) {
                        for (let i=0; i < elements.length; i++) {
                          if (!element.isSameNode(elements[i]) && 
                              elements[i].value !== $scope.model[type][key]) {
                            isValid = false;
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    isValid = util.isString($scope.model[type][key]) && 
                                            $scope.model[type][key].length;
                  }
                  break;

                case 'date':
                  if (!util.isUndefined($scope.model[type][key])) {
                    let date = moment($scope.model[type][key]);
                    if (date.isValid()) {
                      if (type === 'register' && key === 'born')
                            isValid = moment().diff(date, 'years', false) >= 18;
                      else  isValid = true;
                    }
                  }
                  break;

                case 'radio':
                case 'select-one':
                  isValid = !util.isUndefined($scope.model[type][key]);
              }
            } else isValid = true;

            isBtnOk = isBtnOk && isValid;
            if (element.hasAttribute('ng-clear-icon'))
              angular.element(element).triggerHandler('onInputChanged', 
                                 !util.isString($scope.model[type][key]) || 
                                               !$scope.model[type][key].length);
            if (element.hasAttribute('ng-checkmark'))
              angular.element(element).triggerHandler('checkmarkShow', isValid);
          }
        });
        if (btnAccept) btnAccept.disabled = !isBtnOk;
      };

      // Accept
      $scope.accept = (type) => {
        let result;
        switch(type) {

          // Rent
          case 'rent':
            result = Object.keys($scope.model[type])
                           .filter((key) => !['min','password2'].includes(key))
                           .reduce((o, k) => { return Object.assign(o, { [k]: $scope.model[type][k] })}, {});
            result.car_id   = parseInt(result.car_id);
            result.start    = moment(result.start).format("YYYY-MM-DD");
            result.end      = moment(result.end).format("YYYY-MM-DD");
            result.date     = moment().format("YYYY-MM-DD");
            result.user_id  = $rootScope.user.id;
            result.day      = moment(result.end).diff(moment(result.start), 'days');
            let index       = util.indexByKeyValue($rootScope.cars, 'id', result.car_id);
            result.tariff   = $rootScope.cars[index].tariff;
            result.total    = result.day *  result.tariff;

            // Rent a car
            http.request({
              url: "./php/rent_car.php",
              method: 'POST',
              data: result
            })
            .then(data => {
              $scope.rentails = data;
              $scope.$applyAsync();
              alert('Az autó bérlése sikerült!');
            })
            .catch(e => console.log(e));
            break;

          // Login
          case 'login':
            result = $scope.model[type];

            // Check user
            http.request({
              url: "./php/login.php",
              method: 'POST',
              data: result
            })
            .then(data => {
              if (util.isObject(data)) {
                $rootScope.user = {
                  id  : data.user.id,
                  name: data.user.name
                };
                localStorage.setItem("userEmail", $scope.model.login.email);
                $rootScope.$applyAsync();
                $scope.rentails = data.rentails;
                $scope.$applyAsync();
                reset('login');
              } else {
                alert('Hibás felhasználó vagy jelszó!');
              }
            })
            .catch(e => console.log(e));
            break;

          // Register
          case 'register':
            result = Object.keys($scope.model[type])
                           .filter((key) => !['email2','password2', 'max'].includes(key))
                           .reduce((o, k) => { return Object.assign(o, { [k]: $scope.model[type][k] })}, {});
            result.born = moment(result.born).format("YYYY-MM-DD");

            // Check user
            http.request({
              url: "./php/register.php",
              method: 'POST',
              data: result
            })
            .then(data => {
              if (data.affectedRows) {
                      $rootScope.user = {
                        id  : data.id,
                        name: data.name
                      };
                      $rootScope.$applyAsync();
                      reset('register');
                      alert('A regisztráció sikerült!');
              } else  alert('A regisztráció nem sikerült!');
            })
            .catch(e => console.log(e));
            break;
        }
      };

      // Check-Out
      $scope.checkout = () => {
        $rootScope.user = {id:null, name:null};
        $rootScope.$applyAsync();
        $scope.rentails = [];
        $scope.$applyAsync();
        reset('login');
      }

      // Reset model
      function reset(type) {
        angular.forEach(Object.keys($scope.model[type]), key => {
          if (type !== 'login' || key !== 'email') {
            $scope.model[type][key] = null;
          }
        });
        $timeout(() => {
          $scope.$applyAsync();
        }, 100);
      }

      // Run check for or model
      $timeout(() => {
        angular.forEach(Object.keys($scope.model), type => $scope.change(type));
      }, 100);
    }
  ]);

})(window, angular);