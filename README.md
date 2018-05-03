
# react-native-background-download

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

## API

### RNBackgroundDownload

### `download(options)`

Download a file to destination

**options**

An object containing options properties

Property | Type | Required | Platforms | Info
-------- | ---- | :------: | :-------: | ----
`id` | String | ✅ | All | Unique ID you give to this download. This ID will help identifying the download task when it is returned to you when the app re-launches
`url` | String | ✅ | All |  URL to file you want to download
`destination` | String | ✅ | All | Where to copy the file to once the download is done
`priority` | Priority (enum) | | Android | The priority of the download. On Android, simultaneous downloads is limited to 4 and the rest are queued, priority help picking the next download. **Default:** Priority.MEDIUM
`network` | Network (enum) | | Android | Give your the ability to limit the download to WIFI only. **Default:** Network.ALL

**returns**

`DownloadTask` - The download task to control and monitor this download

### `checkForExistingDownloads()`

Checks for downloads that ran in background while you app was terminated. Recommended to run at the init stage of the app.

**returns**

`DownloadTask[]` - Array of tasks that were running in the background so you can re-attach callbacks to them

### DownloadTask
