// Generated by CoffeeScript 1.6.3
var Downloader, Path, Url, colors, crypto, defaultFileName, file, fs, isLocalUrl, protocols;

fs = require('fs');

Url = require('url');

Path = require('path');

crypto = require('crypto');

colors = require('colors');

file = hexo.file;

protocols = {
  http: require('http'),
  https: require('https')
};

isLocalUrl = function(url) {
  return fs.existsSync(url);
};

defaultFileName = function(path) {
  var digest, ext, shasum, u;
  u = Url.parse(path);
  shasum = crypto.createHash('sha1').update(u.href);
  ext = Path.extname(u.path);
  digest = shasum.digest('hex');
  return digest + ext;
};

module.exports = Downloader = (function() {
  function Downloader(imageFolder) {
    this.imageFolder = imageFolder;
  }

  Downloader.prototype.download = function(img, callback) {
    var fileName, isLocal, to, url;
    url = img.url;
    fileName = defaultFileName(url);
    to = this.imageFolder + fileName;
    console.log("FILE ".blue + "GET".yellow + " %s", url);
    if (fs.existsSync(to)) {
      console.log("SKIP".green + " %s", fileName);
      if (typeof callback === "function") {
        callback(null, fileName);
      }
      return;
    }
    isLocal = isLocalUrl(url);
    if (isLocal) {
      this.copyLocalImage(url, fileName, function(err, succ) {});
      img.localPath = succ;
      return typeof callback === "function" ? callback(err, succ) : void 0;
    } else {
      return this.downloadRemoteImage(url, fileName, function(err, succ) {
        img.localPath = succ;
        return typeof callback === "function" ? callback(err, succ) : void 0;
      });
    }
  };

  Downloader.prototype.downloadRemoteImage = function(from, fileName, callback) {
    var err, protocol, protocol_name, request, to;
    to = Path.resolve(this.imageFolder, fileName);
    protocol_name = Url.parse(from).protocol;
    protocol = protocols[protocol_name];
    if (protocol == null) {
      err = new Error("Unsupported protocol '" + protocol_name + "'");
      return typeof callback === "function" ? callback(err, fileName) : void 0;
    }
    return request = protocol.get(from, (function(response) {
      var msg, ws;
      if (response.statusCode === 200) {
        msg = ("" + protocol_name + " ").blue + "%d ".green + "%s";
        console.log(msg, response.statusCode, from);
        ws = fs.createWriteStream(to).on("error", function(err) {
          return typeof callback === "function" ? callback(err, fileName) : void 0;
        }).on("close", (function(err) {
          console.log("SAVE".green + " %s", to);
          return typeof callback === "function" ? callback(null, fileName) : void 0;
        }));
        return response.pipe(ws);
      } else {
        msg = "HTTP ".blue + "%d ".red.blue + "%s";
        console.log(msg, response.statusCode, from);
        return typeof callback === "function" ? callback(new Error("HTTP " + response.statusCode), fileName) : void 0;
      }
    })).on("error", function(err) {
      console.log(err.message);
      return callback(err, fileName);
    });
  };

  Downloader.prototype.copyLocalImage = function(from, fileName, callback) {
    var rs, to, ws;
    to = Path.resolve(this.imageFolder, fileName);
    console.log("COPY ".blue + "FROM ".yellow + "%s", from);
    ws = fs.createWriteStream(to).on("error", (function(err) {
      console.log("COPY ".blue + "ErrW ".green + "%s", to);
      return typeof callback === "function" ? callback(err, fileName) : void 0;
    })).on("close", (function(err) {
      console.log("COPY ".blue + "DONE ".green + "%s", to);
      return typeof callback === "function" ? callback(null, fileName) : void 0;
    }));
    return rs = fs.createReadStream(from).on("error", (function(err) {
      console.log("COPY ".blue + "ErrR ".green + "%s", from);
      return typeof callback === "function" ? callback(err, fileName) : void 0;
    })).pipe(ws);
  };

  return Downloader;

})();
