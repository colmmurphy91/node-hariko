var fs          = require('fs'),
    _           = require('lodash'),
    JSON        = require('json5'),
    protagonist = require('protagonist');
var uriParser = require('../uri-parser'),
    logger    = require('../logger');

function HarikoResource (files) {
  this.files = files;
  this._data = {};
  this.warnings = [];
  this.ensureFiles();
}

HarikoResource.prototype = {
  ensureFiles: function () {
    this._data = this._parse(this._loadFile());
  },
  _loadFile: function () {
    logger.verbose('Resource loading files...');
    return _.chain(this.files)
      .map(function (filepath) {
        return fs.readFileSync(filepath).toString();
      })
      .join('')
      .value();
  },
  _parse: function (rawdata) {
    logger.verbose('Resource parsing markdown...');
    var data = protagonist.parseSync(rawdata);
    var apiResource = [];

    if (data.warnings)
      this.warnings = data.warnings;

    for (var i = 0; i < data.ast.resourceGroups.length; i++) {
      var resourceGroup = data.ast.resourceGroups[i];
      for (var ii = 0; ii < resourceGroup.resources.length; ii++) {
        var resource = resourceGroup.resources[ii];

        for (var iii = 0; iii < resource.actions.length; iii++) {
          var action = resource.actions[iii];

          for (var iiii = 0; iiii < action.examples.length; iiii++) {
            var example = action.examples[iiii];

            for (var iiiii = 0; iiiii < example.responses.length; iiiii++) {
              var response = example.responses[iiiii];
              var entry = {
                request:  {
                  method: action.method,
                  uri:    uriParser.parse(resource.uriTemplate)
                },
                response: {
                  statusCode: +response.name,
                  headers:    response.headers,
                  body:       response.body,
                  data:       JSON.parse(response.body)
                }
              };
              apiResource.push(entry);
              logger.verbose('  req: %s %s  res: %s',
                  entry.request.method,
                  entry.request.uri.path,
                  entry.response.statusCode);
            }
          }
        }
      }
    }

    return apiResource;
  },
  toJSON: function () {
    return this._data;
  }
};

exports.HarikoResource = HarikoResource;
exports.create = function (files) {
  return new HarikoResource(files);
};
