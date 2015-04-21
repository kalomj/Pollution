'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  LoadedFiles = mongoose.model('LoadedFile');


/**
 * Return collection of hourly data measurements
 */
exports.stats = function(req, res) {

  LoadedFiles.findOne().sort('filename').exec(function(err, minLoadedFile) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the loadedfiles'
      });
    }
    LoadedFiles.findOne().sort('-filename').exec(function(err,maxLoadedFile) {
      if (err) {
        return res.status(500).json({
          error: 'Cannot list the loadedfiles'
        });
      }

      LoadedFiles.find().exec(function(err,loadedfiles) {
        if (err) {
          return res.status(500).json({
            error: 'Cannot list the loadedfiles'
          });
        }

        var response = {
          min_valid_date : minLoadedFile.valid_date,
          min_valid_time : minLoadedFile.valid_time,
          max_valid_date : maxLoadedFile.valid_date,
          max_valid_time : maxLoadedFile.valid_time,
          files_collection : loadedfiles
        };
        res.json(response);
      });

    });

  });
};