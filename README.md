# FetchApp

<a name="top"></a>

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

<a name="overview"></a>

# Overview

**This is a Google Apps Script library which enhances Class UrlFetchApp to assist in creating and requesting multipart/form-data.**

<a name="description"></a>

# Description

Google Apps Script provides [Class UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) with a fetch method [`fetch(url, params)`](<https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object)>), however, the request body for [multipart/form-data](https://www.w3.org/TR/html5/sec-forms.html#multipart-form-data), must be created by the user, and it is [a bit difficult to do so](https://gist.github.com/tanaikech/d595d30a592979bbf0c692d1193d260c). I've created this library in the hope that simplification of this process would be useful for others.

<a name="methods"></a>

# Methods

| Method                                | Description                                                                                                                                                                                                                                                                                                                                               |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [fetch(url, params)](#fetch)          | This method is used for running a single request. This method uses `UrlFetchApp.fetch()`. The type of "url" and "params" are string and object, respectively. "params" uses the object of `UrlFetchApp.fetch(url, params)`. In this method, a property of `body` is added. This is demonstrated in the sample script below. |
| [fetchAll(requests[])](#fetchall)     | This method is used for running multiple requests. This method uses `UrlFetchApp.fetchAll()`. Each request is processed asynchronously. The type of "requests" is an object. "requests" uses the object of `UrlFetchApp.fetchAll(requests)`. In this method, a property of `body` is added. This is demonstrated in the sample script below. |
| [createFormData()](#createformdata)   | This method is used for creating an instance of formData.                                                                                                                                                                                                                                                                                                 |
| [append(key, value)](#createformdata) | This method appends a formData using key and value to created formData. The type of "key" and "value" are string and blob, respectively. This is demonstrated in the sample script below.                                                                                                                                                    |

> - `params` of `FetchApp.fetch(url, params)` and `requests[]` of `FetchApp.fetchAll(requests[])` are basically the same with `params` of [`UrlFetchApp.fetch(url, params)`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl-params) and `requests[]` of [`UrlFetchApp.fetchAll(requests[])`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchallrequests), respectively. At `FetchApp`, the property of `body` is used for giving the form data. Other properties are the same as in `UrlFetchApp`.

> - If `payload` of property is used in `params` and `requests[]`, `body` is not used; it is completely the same as the default `UrlFetchApp`. Only when `body` is used is multipart/form-data requested.

I would like to add more methods in the future.

# Library's project key

```
1sm9V-w8-0i3U4-10N6XyaRjHk5voiuJ1ArKSLo3htOUasB6GcPcIq8Kb
```

# How to install

- Open Script Editor. Click as follows:
- -> Resource
- -> Library
- -> Input the Script ID in the text box. The Script ID is **`1sm9V-w8-0i3U4-10N6XyaRjHk5voiuJ1ArKSLo3htOUasB6GcPcIq8Kb`**.
- -> Add library
- -> Please select the latest version
- -> Developer mode ON (Or select others if you don't want to use the latest version)
- -> The identifier is "**`FetchApp`**". This is set under the default.

[You can read more about libraries in Apps Script here](https://developers.google.com/apps-script/guide_libraries).

## About scopes

This library uses the following scope. This is installed in the library, and nothing further is required from the user.

- `https://www.googleapis.com/auth/script.external_request`

# Methods

<a name="fetch"></a>

## 1. fetch(url, params)

This method is used for running a single request. This method uses `UrlFetchApp.fetch()`. The type of "url" and "params" are string and object, respectively. "params" uses the object of `UrlFetchApp.fetch(url, params)`. In this method, a property of `body` is added.

### Sample script

As an example, this is how one may convert a PDF file to a new Google Document using the method of [files.create](https://developers.google.com/drive/api/v3/reference/files/create). (Drive API v3)

```javascript
function sample1() {
  var fileId = "### fileId of PDF ###";
  var metadata = {
    name: "sampleDocument", // Filename of created Google Document
    mimeType: MimeType.GOOGLE_DOCS, // MimeType of Google Document
  };
  var fileBlob = DriveApp.getFileById(fileId).getBlob();
  var form = FetchApp.createFormData(); // Create form data
  form.append(
    "metadata",
    Utilities.newBlob(JSON.stringify(metadata), "application/json")
  );
  form.append("file", fileBlob);
  var url =
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  var params = {
    method: "POST",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    body: form,
  };
  var res = FetchApp.fetch(url, params);
  Logger.log(res);
  // DriveApp.createFile(blob) // This comment line is used for automatically detecting scope for running this sample script.
}
```

<a name="fetchall"></a>

## 2. fetchAll(requests)

This method is used for running multiple requests. This method uses `UrlFetchApp.fetchAll()`. Each request is processed asynchronously. The type of "requests" is an object. "requests" uses the object of `UrlFetchApp.fetchAll(requests)`. In this method, a property of `body` is added.

### Sample script

As an example, this shows how to overwrite two existing Google Documents using the content of two text files using the method of [files.update](https://developers.google.com/drive/api/v3/reference/files/update). (Drive API v3) Currently, [the Drive API batch request cannot use the file media](https://developers.google.com/drive/api/v3/batch). This sample script might become a workaround for updating files by quasi-batching requests via an asynchronous process.

```javascript
function sample2() {
  var contents = [
    {
      fileName: "newFilename1", // new filename
      docs: "### GoogleDocumentId1 ###", // Destination fileId of existing Google Document.
      textFile: "### textFileId1 ###", // Source fileId of text file.
    },
    {
      fileName: "newFilename2",
      docs: "### GoogleDocumentId2 ###",
      textFile: "### textFileId2 ###",
    },
  ];
  var accessToken = ScriptApp.getOAuthToken();
  var requests = contents.map(function (e) {
    var metadata = { name: e.fileName };
    var form = FetchApp.createFormData(); // Create form data
    form.append(
      "metadata",
      Utilities.newBlob(JSON.stringify(metadata), "application/json")
    );
    form.append("file", DriveApp.getFileById(e.textFile).getBlob());
    var url =
      "https://www.googleapis.com/upload/drive/v3/files/" +
      e.docs +
      "?uploadType=multipart";
    params = {
      url: url,
      method: "PATCH",
      headers: { Authorization: "Bearer " + accessToken },
      body: form,
    };
    return params;
  });
  var res = FetchApp.fetchAll(requests);
  Logger.log(res);
  // DriveApp.createFile(blob) // This comment line is used for automatically detecting scope for running this sample script.
}
```

<a name="createformdata"></a>

## 3. createFormData(), append(key, value)

`createFormData()` and `append(key, value)` are used for creating an instance of formData, and appending an object to formData, respectively.

**Sample scripts may be seen under the sections for [`fetch(url, params)`](#fetch) and [`fetchAll(requests)`](#fetchall).**

- I referred to Javascript's [`Form​Data()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) and [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) methods in creating these methods.

# IMPORTANT

I created this library for requesting multipart/form-data using Google Apps Script. While in my test scenarios, I could confirm that this script works, I am sorry to say that I cannot guarantee it will work for all purposes. I would like to make this library more encompassing; please report any issues you encounter.

I sincerely hope this library is useful for you.

---

<a name="Licence"></a>

# Licence

[MIT](LICENCE)

<a name="Author"></a>

# Author

[Tanaike](https://tanaikech.github.io/about/)

If you have any questions or comments, feel free to contact me.

<a name="Update_History"></a>

# Update History

- v1.0.0 (April 20, 2019)

  1. Initial release.

- v1.0.1 (April 13, 2020)

  1. When V8 runtime is enabled, it was found that an error occurred. So this bug was removed.

[TOP](#top)
