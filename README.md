
# react-native-background-download

A library for React-Native to help you download large files on iOS and Android both in the foreground and most impotently in the background.

## ToC

- [Usage](#usage)
- [API](#api)
- [Constants](#constants)

## Getting started

`$ npm install react-native-background-download --save`

### Mostly automatic installation

`$ react-native link react-native-background-download`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-background-download` and add `RNBackgroundDownload.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNBackgroundDownload.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.eko.RNBackgroundDownloadPackage;` to the imports at the top of the file
  - Add `new RNBackgroundDownloadPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-background-download'
  	project(':react-native-background-download').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-background-download/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-background-download')
  	```

### iOS - Extra Mandatory Step
In your `AppDelegate.m` add the following code:
```objc
...
#import <RNBackgroundDownload.h>
...
...
- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)())completionHandler
{
  [RNBackgroundDownload setCompletionHandlerWithIdentifier:identifier completionHandler:completionHandler];
}
...
```
Failing to add this code will result in cancled background downloads.

## Usage

### Downloading a file

```javascript
import RNBackgroundDownload from 'react-native-background-download';

let task = RNBackgroundDownload.download({
	id: 'file123',
	url: 'https://link-to-very.large/file.zip'
	destination: `${RNBackgroundDownload.directories.documents}/file.zip`
}).begin((expectedBytes) => {
	console.log(`Going to download ${expectedBytes} bytes!`);
}).progress((percent) => {
	console.log(`Downloaded: ${percent * 100}%`);
}).done(() => {
	console.log('Downlaod is done!');
}).error((error) => {
	console.log('Download canceled due to error: ', error);
});

// Puase the task
task.pause();

// Resume after pause
task.resume();

// Cancel the task
task.stop();
```

### Re-Attaching to background downloads

This is the main selling point of this library (but it's free!).

What happens to your downloads after the OS stopped your app? Well, they are still there, we just need to selvage them.

Add this code in your app's init stage, and you'll never lose a download again!

```javascript
import RNBackgroundDownload from 'react-native-background-download';

let lostTasks = await RNBackgroundDownload.checkForExistingDownloads();
for (let task of lostTask) {
	console.log(`Task ${task.id} was found!`);
	task.progress((percent) => {
		console.log(`Downloaded: ${percent * 100}%`);
	}).done(() => {
		console.log('Downlaod is done!');
	}).error((error) => {
		console.log('Download canceled due to error: ', error);
	});
}
```

`task.id` is very important for re-attaching the download task with any UI component representing that task, this is why you need to make sure to give sensible IDs that you know what to do with, try to avoid using random IDs.

## API

### RNBackgroundDownload

### `download(options)`

Download a file to destination

**options**

An object containing options properties

| Property      | Type            | Required | Platforms | Info                                                                                                                                                                            |
| ------------- | --------------- | :------: | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | String          | ✅        | All       | Unique ID you give to this download. This ID will help identifying the download task when it is returned to you when the app re-launches                                        |
| `url`         | String          | ✅        | All       | URL to file you want to download                                                                                                                                                |
| `destination` | String          | ✅        | All       | Where to copy the file to once the download is done                                                                                                                             |
| `priority`    | [Priority (enum)](#priority-enum---android-only) |          | Android   | The priority of the download. On Android, simultaneous downloads is limited to 4 and the rest are queued, priority helps picking the next download. **Default:** Priority.MEDIUM |
| `network`     | [Network (enum)](#network-enum---android-only)  |          | Android   | Give your the ability to limit the download to WIFI only. **Default:** Network.ALL                                                                                              |

**returns**

`DownloadTask` - The download task to control and monitor this download

### `checkForExistingDownloads()`

Checks for downloads that ran in background while you app was terminated. Recommended to run at the init stage of the app.

**returns**

`DownloadTask[]` - Array of tasks that were running in the background so you can re-attach callbacks to them

### DownloadTask

A class representing a download task created by `RNBackgroundDownload.download`

### `Members`
| Name           | Type   | Info                                                                                                 |
| -------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `id`           | String | The id you gave the task when calling `RNBackgroundDownload.download`                                |
| `percent`      | Number | The current percent of completion of the task between 0 and 1                                        |
| `bytesWritten` | Number | The number of bytes currently written by the task                                                    |
| `totalBytes`   | Number | The number bytes expected to be written by this task or more plainly, the file size being downloaded |

### `Callback Methods`
Use these methods to stay updated on what's happening with the task.

All callback methods return the current instance of the `DownloadTask` for chaining.

| Function   | Callback Arguments                | Info                                                                                                                          |
| ---------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `begin`    | expectedBytes                     | Called when the first byte is received. 💡: this is good place to check the device has enough storage space for this download |
| `progress` | percent, bytesWritten, totalBytes | Called at max every 1.5s so you can update your progress bar accordingly                                                      |
| `done`     |                                   | Called when the download is done, the file is at the destination you've set                                                   |
| `error`    | error                             | Called when the download stops due to an error                                                                                |

### `pause()`
Pauses the download

### `resume()`
Resumes a pause download

### `stop()`
Stops the download for good and removes the file that was written so far

## Constants

### directories

### `documents`

And absolute path to the app's documents directory, a good path to download files to.

### Priority (enum) - Android only

`Priority.HIGH`

`Priority.MEDIUM` - Default ✅

`Priority.LOW`

### Network (enum) - Android only

`Network.WIFI_ONLY`

`Network.ALL` - Default ✅