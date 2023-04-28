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
      $rootScope.user = {id:null, type:null, name:null};

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
    '$scope',
    '$timeout',
    'util',
    'http',
    function($scope, $timeout, util, http) {

      console.log('rentController');

      // Input model
      $scope.model = {
        rent: {
          carID: null,
          start: null,
          end: null
        },
        login: {
          email: localStorage.getItem("userEmail"),
          password: ''
        },
        register: {
          prefixName: null,
          firstName: null,
          middleName: null,
          lastName: null,
          postfixName: null,
          gender: null,
          born: null,
          email: null,
          email2: null,
          password: null,
          password2: null
        },
        profile: {
          prefixName: null,
          firstName: null,
          middleName: null,
          lastName: null,
          postfixName: null,
          gender: null,
          born: null,
          email: null,
          password: null
        }
      }

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
                  if (element.type === 'email' || element.classList.contains('input-email')) {
                    isValid = util.isEmail($scope.model[type][key]);
                    if (isValid) {
                      let parent    = element.closest('form');
                      let elements  = parent.querySelectorAll('.input-email');
                      if (elements.length > 1) {
                        for (let i=0; i < elements.length; i++) {
                          if (!element.isSameNode(elements[i]) && $scope.model[type][key] !== elements[i].value) {
                            isValid = false;
                            break;
                          }
                        }
                      }
                    }
                  } else if (element.classList.contains('input-password')) {
                    isValid = util.isPassword($scope.model[type][key]);
                    let parent    = element.closest('form');
                    let elements  = parent.querySelectorAll('.input-password');
                    if (elements.length > 1) {
                      for (let i=0; i < elements.length; i++) {
                        if (!element.isSameNode(elements[i]) && $scope.model[type][key] !== elements[i].value) {
                          isValid = false;
                          break;
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
                  break;
                default:
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
          case 'rent':
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
                $scope.user.id    = data.id;
                $scope.user.type  = data.type;
                $scope.user.name  = data.name;
                localStorage.setItem("userEmail", $scope.model.login.email);
                $scope.$applyAsync();
              } else {
                alert('Hibás felhasználó vagy jelszó!');
              }
            })
            .catch(e => console.log(e));
            break;
          case 'register':
            result = Object.keys($scope.model[type])
                           .filter((key) => !['email2','password2'].includes(key))
                           .reduce((o, k) => { return Object.assign(o, { [k]: $scope.model[type][k] })}, {});
            result.born = moment(result.born).format("YYYY-MM-DD");

            // Check user
            http.request({
              url: "./php/register.php",
              method: 'POST',
              data: result
            })
            .then(data => {
              if (data.affectedRows)
                    alert('A regisztráció sikerült!');
              else  alert('A regisztráció nem sikerült!');
            })
            .catch(e => console.log(e));
            break;
          default:
            return;
        }
      };

      // Check-Out
      $scope.checkout = () => {
        $scope.user.id    = null;
        $scope.user.type  = null;
        $scope.user.name  = null;
        $scope.$applyAsync();
        //$scope.reset('login');
      }

      // Run check for or model
      $timeout(() => {
        angular.forEach(Object.keys($scope.model), type => $scope.change(type));
      }, 100);
    }
  ])

  // Table controller
  .controller('tableController', [
    '$scope',
    '$stateParams',
    'http',
    function($scope, $stateParams, http) {
      $scope.tblName = $stateParams.tblName;
      http.request({
        url: "./php/get.php",
        method: 'POST',
        data: {str: `../str/${$scope.tblName}.json`}
      })
      .then(data => {
        $scope.data = data;
        $scope.$applyAsync();
      })
      .catch(e => console.log(e));
    }
  ]);

})(window, angular);