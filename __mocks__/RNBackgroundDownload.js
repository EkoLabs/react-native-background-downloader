import { NativeModules } from 'react-native';

NativeModules.RNBackgroundDownload = {
    download: jest.fn(),
    addListener: jest.fn()
};