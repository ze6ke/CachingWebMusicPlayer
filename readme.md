# Caching Music Player

This app is a web page that uses cache manifests and indexedDB to store a music library locally in your browser and allow you to access the music while offline.

The primary intent of the application is to test the limits of modern browsers, but I'm not aware of a comparable open source product.

Currently, it works up to the limit of indexedDB (typically 10% of free disk space).  However, several modern browsers have a memory leak when you download lots of data through ajax and this app might need to be refreshed several times during the loading process.

Also, chrome, at least, does not notify the app when it fails to write to indexedDB because of a lack of space, so the app silently stops storing data when the quota is filled up.

Last, this app is in active development.
