/**
 * GitHub  https://github.com/tanaikech/FetchApp<br>
 * Library name
 * @type {string}
 * @const {string}
 * @readonly
 */
var appName = "FetchApp";

/**
 * Fetch single request.<br>
 * @param {string} url URL for fetching.
 * @param {object} params Parameters for fetching.
 * @return {object} Response
 */
function fetch(url, params) {
    return new FetchApp().Fetch(url, params);
}

/**
 * Fetch multiple requests.<br>
 * @param {object[]} requests requests for fetching.
 * @return {object[]} Responses[]
 */
function fetchAll(requests) {
    return new FetchApp().FetchAll(requests);
}

/**
 * Create instance for creating form data.<br>
 * @return {FetchApp}
 */
function createFormData() {
    return new FetchApp();
}

/**
 * Append form data.<br>
 * @param {string} key key of formData
 * @param {object} blob value of formData. Give this as a blob.
 * @return {FetchApp}
 */
function append(key, blob) {
    return this.append(key, blob);
}
;
(function(r) {
  var FetchApp;
  FetchApp = (function() {
    var createPayload;

    FetchApp.name = appName;

    function FetchApp() {
      this.name = appName;
      this.objectForFetchApp = {};
    }

    FetchApp.prototype.Fetch = function(url_, params_) {
      var e;
      if (!("payload" in params_)) {
        try {
          createPayload.call(this, params_);
        } catch (error) {
          e = error;
          throw new Error("Object for request is wrong. Please confirm formData again.");
        }
      }
      return UrlFetchApp.fetch(url_, params_);
    };

    FetchApp.prototype.FetchAll = function(requests_) {
      var e, len, reqs;
      try {
        len = requests_.length;
        reqs = requests_.map((function(_this) {
          return function(e) {
            if (!("payload" in e)) {
              return createPayload.call(_this, e);
            }
            return e;
          };
        })(this));
      } catch (error) {
        e = error;
        throw new Error("Object for request is wrong. Please confirm formData again.");
      }
      return UrlFetchApp.fetchAll(reqs);
    };

    FetchApp.prototype.append = function(key_, blob_) {
      if (!key_ || !blob_) {
        throw new Error("Wrong values. 'key' is a string. 'blob' is a blob.");
      }
      if (this.objectForFetchApp[key_]) {
        throw new Error("Duplicated key.");
      }
      this.objectForFetchApp[key_] = blob_;
      return this;
    };

    createPayload = function(params_) {
      var boundary, obj, object, payload;
      if ("body" in params_) {
        boundary = "xxxxxxxxxx" + this.name + "xxxxxxxxxx";
        object = params_.body.objectForFetchApp;
        obj = Object.keys(object);
        payload = obj.reduce(function(ar, e, i) {
          var data;
          if (!(object[e].toString() === "Blob" && typeof object[e] === "object")) {
            throw new Error("Value of formData is not a Blob.");
          }
          data = "Content-Disposition: form-data; name=\"" + (e || "sample" + i) + "\"; filename=\"" + (e || "sample" + i) + "\"\r\n";
          data += "Content-Type: " + (object[e].getContentType() || "application/octet-stream") + "; charset=UTF-8\r\n\r\n";
          Array.prototype.push.apply(ar, Utilities.newBlob(data).getBytes());
          ar = ar.concat(object[e].getBytes());
          Array.prototype.push.apply(ar, Utilities.newBlob("\r\n--" + boundary + (i === obj.length - 1 ? "--" : "\r\n")).getBytes());
          return ar;
        }, Utilities.newBlob("--" + boundary + "\r\n").getBytes());
        params_.payload = payload;
        params_.contentType = "multipart/form-data; boundary=" + boundary;
      }
      return params_;
    };

    return FetchApp;

  })();
  return r.FetchApp = FetchApp;
})(this);
