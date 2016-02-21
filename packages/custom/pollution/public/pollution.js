'use strict';

angular.module('mean.pollution',['mean.system', 'ngMap','ui.slider','chart.js'])
    .config(['$viewPathProvider', function($viewPathProvider) {
        $viewPathProvider.override('system/views/index.html', 'pollution/views/index.html');
        $viewPathProvider.override('users/views/index.html', 'pollution/views/login/index.html');
        $viewPathProvider.override('users/views/login.html', 'pollution/views/login/login.html');
        $viewPathProvider.override('users/views/register.html', 'pollution/views/login/register.html');
        $viewPathProvider.override('users/views/forgot-password.html', 'pollution/views/login/forgot-password.html');
        $viewPathProvider.override('users/views/reset-password.html', 'pollution/views/login/reset-password.html');
    }
    ]);