'use strict';

var chart = require('../controllers/chart');

module.exports = function(Pollution, app, auth) {

    app.route('/chart')
        .get(chart.all);
    app.route('/chart/:measurement_key')
        .get(chart.show);

    // Finish with setting up the chart param
    app.param('measurement_key', chart.chart);
};
