# FetchApp

<a name="top"></a>

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

<a name="overview"></a>

# Overview

**This is a GAS library for creating and requesting the type of multipart/form-data using Google Apps Script. This library enhances Class UelFetchApp of Google Apps Script.**

<a name="description"></a>

# Description

In order to fetch data from URL, there is [Class UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app) in Google Apps Script. As the method for fetching, there is the method of [`fetch(url, params)`](<https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object)>). In the current stage which was released this library, when user want to request with [the type of multipart/form-data](https://www.w3.org/TR/html5/sec-forms.html#multipart-form-data), the request body is required to be created by the user. But it is [a bit difficult to create the request body](https://gist.github.com/tanaikech/d595d30a592979bbf0c692d1193d260c). I thought that if the request body for the type of multipart/form-data can be easily created, it might be also useful for other users. So I created this as a GAS library.

<a name="methods"></a>

# Methods

| Method                                | Description                                                                                                                                                                                                                                                                                                                                               |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [fetch(url, params)](#fetch)          | This method is used for running a single request. This method uses `UrlFetchApp.fetch()`. Each type of "url" and "params" is string and object, respectively. "params" uses the object of `UrlFetchApp.fetch(url, params)`. In this method, a property of `body` is added. About this, please check the following sample script.                          |
| [fetchAll(requests[])](#fetchall)     | This method is used for running multiple requests. This method uses `UrlFetchApp.fetchAll()`. By this, each request works by the asynchronous process. Type of "requests" is object. "requests" uses the object of `UrlFetchApp.fetchAll(requests)`. In this method, a property of `body` is added. About this, please check the following sample script. |
| [createFormData()](#createformdata)   | This method is used for creating an instance of formData.                                                                                                                                                                                                                                                                                                 |
| [append(key, value)](#createformdata) | This method appends a formData using key and value to created formData. Each type of "key" and "value" is string and blob, respectively. About this, please check the following sample script.                                                                                                                                                            |

I would like to add more methods in the future.

# Library's project key

```
1sm9V-w8-0i3U4-10N6XyaRjHk5voiuJ1ArKSLo3htOUasB6GcPcIq8Kb
```

# How to install

- Open Script Editor. And please operate follows by click.
- -> Resource
- -> Library
- -> Input Script ID to text box. Script ID is **`1sm9V-w8-0i3U4-10N6XyaRjHk5voiuJ1ArKSLo3htOUasB6GcPcIq8Kb`**.
- -> Add library
- -> Please select latest version
- -> Developer mode ON (If you don't want to use latest version, please select others.)
- -> Identifier is "**`FetchApp`**". This is set under the default.

[If you want to read about Libraries, please check this.](https://developers.google.com/apps-script/guide_libraries).

## About scopes

This library uses the following 1 scope. This is installed in the library. So users are not required to do anything for this.

- `https://www.googleapis.com/auth/script.external_request`

# Methods

<a name="fetch"></a>

## 1. fetch(url, params)

This method is used for running a single request. This method uses `UrlFetchApp.fetch()`. Each type of "url" and "params" is string and object, respectively. "params" uses the object of `UrlFetchApp.fetch(url, params)`. In this method, a property of `body` is added.

### Sample script

As a sample situation, it supposes to convert PDF file to new Google Document using the method of [files.create](https://developers.google.com/drive/api/v3/reference/files/create) Drive API v3.

```javascript
function sample1() {
  var fileId = "### fileId of PDF ###";
  var metadata = {
    name: "sampleDocument", // Filename of created Google Document
    mimeType: MimeType.GOOGLE_DOCS // MimeType of Google Document
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
    body: form
  };
  var res = FetchApp.fetch(url, params);
  Logger.log(res);
  // DriveApp.createFile(blob) // This comment line is used for automatically detecting scope for running this sample script.
}
```

<a name="fetchall"></a>

## 2. fetchAll(requests)

This method is used for running multiple requests. This method uses `UrlFetchApp.fetchAll()`. By this, each request works by the asynchronous process. Type of "requests" is object. "requests" uses the object of `UrlFetchApp.fetchAll(requests)`. In this method, a property of `body` is added.

### Sample script

As a sample situation, it supposes to overwrite 2 existing Google Documents by 2 text files using the method of [files.update](https://developers.google.com/drive/api/v3/reference/files/update) Drive API v3. In the current stage, [the batch request of Drive API cannot use the file media.](https://developers.google.com/drive/api/v3/batch) This sample script might become a workaround for updating files by quasi batching request with the asynchronous process.

```javascript
function sample2() {
  var contents = [
    {
      fileName: "newFilename1", // new filename
      docs: "### GoogleDocumentId1 ###", // Destination fileId of existing Google Document.
      textFile: "### textFileId1 ###" // Source fileId of text file.
    },
    {
      fileName: "newFilename2",
      docs: "### GoogleDocumentId2 ###",
      textFile: "### textFileId2 ###"
    }
  ];
  var accessToken = ScriptApp.getOAuthToken();
  var requests = contents.map(function(e) {
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
      body: form
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

`createFormData()` and `append(key, value)` are used for creating an instance of formData and append object to formData, respectively.

**About the sample scripts, you can see them at [`fetch(url, params)`](#fetch) and [`fetchAll(requests)`](#fetchall).**

- About these methods, I referred [`Form​Data()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) and [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) of Javascript.

# IMPORTANT

I created this library for requesting the type of multipart/form-data using Google Apps Script. In my test situations, I could confirm that this script works. But I think that this library cannot be used for other all situations. About this, I apologize. I would like to make this library grow by knowing various situations in the future.

If this library was useful for you, I'm glad.

---

<a name="Licence"></a>

# Licence

[MIT](LICENCE)

<a name="Author"></a>

# Author

[Tanaike](https://tanaikech.github.io/about/)

If you have any questions and commissions for me, feel free to contact me.

<a name="Update_History"></a>

# Update History

- v1.0.0 (April 20, 2019)

  1. Initial release.

[TOP](#top)
