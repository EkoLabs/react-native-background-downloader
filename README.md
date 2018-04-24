
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


## Usage
```javascript
import RNBackgroundDownload from 'react-native-background-download';

// TODO: What to do with the module?
RNBackgroundDownload;
```
  