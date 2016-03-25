/*jshint esversion: 6 */
/*jshint globalstrict: true */
'use strict';

const jsdom = require("jsdom");

const query_url = "http://www.imdb.com/find?s=tt&q=";

module.exports = (pluginContext) => {
    const shell = pluginContext.shell;
    const logger = pluginContext.logger;

    function search(query, res) {
      const query_trim = query.trim();
      if (query_trim.length === 0)
      return;

      res.add({
        id: '__temp',
        title: 'fetching...',
        desc: 'from IMDb',
        icon: '#fa fa-circle-o-notch fa-spin'
      });

      var url = query_url + query_trim;

      jsdom.env({
        url: url,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function (err, window) {
          res.remove('__temp');
          var $ = window.$;
          
          if ($("tr.findResult").length == 0) {
            return res.add({
              id: 'error',
              title: 'No results found',
              desc: 'on IMDb website',
              icon: '#fa fa-close'
            });
          }

          $("tr.findResult").each(function (index, element) {
            res.add({
              id: "http://www.imdb.com/" + $(this).find('.result_text a').attr('href'),
              payload: 'open',
              title: $(this).find('.result_text a').text(),
              icon: $(this).find('.primary_photo a img').attr('src'),
              desc: $(this).find('.result_text').contents().filter(function() {
                  return this.nodeType == 3;
                }).text()
            });
            return index < 4;
          });
        }
      });
    }

    function execute(movie, payload) {
        if (payload !== 'open') {
            return;
        }
        if (movie !== "error" && movie !== "__temp") {
          shell.openExternal(movie);
        }
    }

    return {search, execute};
};