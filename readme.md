# Caching Music Player

This app is a web page that uses cache manifests and indexedDB to store a music library locally in your browser and allow you to access the music while offline.

The primary intent of the application is to test the limits of modern browsers, but I'm not aware of a comparable open source product.

I've tested it on several browsers:

- Safari 10 on iPhone--Music stops playing immediately when the tab loses focus (e.g., the screen is locked).  This makes the app more or less useless.
- chrome on iphone--When the screen is locked, the current song finishes, but the next song does not start (it appears that javascript doesn't run in the background).
- chrome on desktop--indexedDB doesn't give errors when it runs out of space.  Chrome supports quota management, but that only seems to work well with the filesystem API.  It would probably be possible to use the quota API to prevent undetected out of space errors, but the locked screen behavior prevents the app from being terribly useful in chrome.  Chrome seems to leak memory with XHR and Fetch requests, but refreshing the page seems to recover the memory.
- firefox on desktop--the app behaves as expected.  Firefox supports a proprietary persistent storage option in indexedDB that I'm not using.  Firefox seems to leak memory with XHR and Fetch requests, and the memory doesn't get recovered until it's restarted.  Firefox does give errors when the quota is exceeded, which happened at 2GB of storage (I have about 100GB free space).
- firefox on iphone--locking behavior is the same as chrome and the desktop version--finish the song, but don't start another one.  Crashes while loading data, so it appears to suffer from the same leak as the desktop.  Otherwise, behaves well.
- dolphin (Safari 9)--javascript runs even while the screen is locked.  Cache manifests also seem to work.  This means that the app is usable.  I haven't yet tested how it behaves when fully loaded.

This app was initially created to help linux users work with their iphones better (it's difficult to connect an iphone to a linux desktop computer).  It was not obvious at the beginning of the project whether it would be feasible.  The limitations of specific browsers make the potential audience virtually non-existant.  Because of that, and the fact that it's a lot of work, I won't invest a ton of energy into making this a glossy app.  The code is here for my personal notes, and to serve as a potential learning tool for others.

This app is no longer in active development.  It's stable and does some stuff fairly well.  If it was valuable to finish the project here is what would still need to be done:

- make some tool to assist the user in preparing and hosting the library (e.g., a command line interface that kicks off the parsing and then hosting).
- write/find a customer audio player UI--The standard one can't be customized particularly well and behaves poorly on iphones.

