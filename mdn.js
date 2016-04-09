
var debug = require('debug')('mdn.vim');
var _ = require('lodash');
var request = require('request');
var htmlparser = require('htmlparser2');
var chalk = require('chalk');

module.exports = mdn;

function push(output, msg) {
  if (!msg) output.push('\n');
  var args = Array.prototype.slice.call(arguments, 1);
  output.push.apply(output, args);
}

function pushnoln(output) {
  var args = Array.prototype.slice.call(arguments, 1);
  output[ output.length - 1 ] += args.join('');
}

function mdn(query, done) {
  var url = 'http://mdn.io/' + query;

  var output = [];

  var add = push.bind(null, output);
  var addnoln = pushnoln.bind(null, output);

  debug('Query %s', url);
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var handler = new htmlparser.DomHandler(function (error, dom) {
        if (!error) {
          var header, article;

          (function walk(dom) {
            if (!article) {
              _.forEach(dom, function (elem) {
                if (elem.name === 'h1') {
                  header = elem.children;
                } else if (elem.name === 'article') {
                  article = elem.children;
                } else {
                  walk(elem.children);
                }
              });
            }
          })(dom);

          _.forEach(header, function (elem) {
            add(elem.data);
            add(_.repeat('=', elem.data.length));
            add();
          });

          (function walk(dom, style, indent, pre) {
            _.forEach(dom, function (elem) {
              switch (elem.type) {
                case 'tag':
                  switch (elem.name) {
                    case 'br':
                      add();
                      break;
                    case 'code':
                      walk(elem.children, style.blue, indent, pre);
                      break;
                    case 'dd':
                      add('  ');
                      walk(elem.children, style, indent);
                      add();
                      add();
                      break;
                    case 'div':
                      if (elem.attribs.class !== 'htab') {
                        switch (elem.attribs.id) {
                          case 'compat-desktop':
                            add('Desktop');
                            add('-------');
                            break;
                          case 'compat-mobile':
                            add('Mobile');
                            add('------');
                            break;
                        }
                        walk(elem.children, style, indent);
                      }
                      break;
                    case 'dt':
                      walk(elem.children, style, indent);
                      add();
                      break;
                    case 'em':
                      walk(elem.children, style.italic, indent);
                      break;
                    case 'h2':
                      add();
                      walk(elem.children, style.red, indent);
                      add();
                      add();
                      break;
                    case 'h3':
                      add();
                      walk(elem.children, style.yellow, indent);
                      add();
                      add();
                      break;
                    case 'h4':
                      add();
                      walk(elem.children, style.green, indent);
                      add();
                      add();
                      break;
                    case 'li':
                      add();
                      add(_.repeat(' ', indent) + '- ');
                      walk(elem.children, style, indent);
                      add();
                      break;
                    case 'p':
                      if (elem.children.length) {
                        walk(elem.children, style, indent);
                        add();
                        add();
                      }
                      break;
                    case 'pre':
                      if (elem.attribs.class === 'syntaxbox') {
                        walk(elem.children, style, indent);
                        add();
                        add();
                      } else {
                        walk(elem.children, style, indent, true);
                        add();
                      }
                      break;
                    case 'span':
                      walk(elem.children, style, indent);
                      if (elem.attribs.title) {
                        addnoln(' ' + style.inverse(elem.attribs.title));
                      }
                      break;
                    case 'strong':
                      walk(elem.children, style.bold, indent);
                      break;
                    case 'td':
                      addnoln('| ');
                      walk(elem.children, style, indent);
                      addnoln('\t');
                      break;
                    case 'th':
                      addnoln('| ');
                      walk(elem.children, style.underline, indent);
                      addnoln('\t');
                      break;
                    case 'tr':
                      walk(elem.children, style, indent);
                      add('|');
                      add();
                      break;
                    case 'ul':
                      walk(elem.children, style, indent + 2);
                      add();
                      break;
                    case 'var':
                      walk(elem.children, style.underline, indent);
                      break;
                    default:
                      walk(elem.children, style, indent);
                  }
                  break;
                case 'text':
                  if (pre) {
                    var lines = _.trim(elem.data, '\r\n').split(/\r?\n/);
                    for (var i = 0; i < lines.length; ++i) {
                      add(style('  ' + (i + 1) + '\t' + lines[i]));
                    }
                  } else {
                    var data = _.trim(elem.data, '\r\n');
                    if (data.trim()) {
                      addnoln(style(_.unescape(data)));
                    }
                  }
                  break;
                default:
                  walk(elem.children, style, indent);
              }
            });
          })(article, chalk.reset, 0);

          done(null, output);
        }
      });

      var parser = new htmlparser.Parser(handler);
      parser.write(body);
      parser.done();
    }
  });
}
