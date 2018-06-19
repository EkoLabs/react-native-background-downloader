import { NativeModules } from 'react-native';

const listeners = {};

// states:
// 0 - Running
// 1 - Suspended / Paused
// 2 - Cancelled / Failed
// 3 - Completed (not necessarily successfully)

NativeModules.RNBackgroundDownload = {
    download: jest.fn(),
    pauseTask: jest.fn(),
    resumeTask: jest.fn(),
    stopTask: jest.fn(),
    TaskRunning: 0,
    TaskSuspended: 1,
    TaskCanceling: 2,
    TaskCompleted: 3,
    checkForExistingDownloads: jest.fn().mockImplementation(() => {
        foundDownloads = [
            {
                id: 'taskRunning',
                state: NativeModules.RNBackgroundDownload.TaskRunning,
                percent: 0.5,
                bytesWritten: 50,
                totalBytes: 100
            },
            {
                id: 'taskPaused',
                state: NativeModules.RNBackgroundDownload.TaskSuspended,
                percent: 0.7,
                bytesWritten: 70,
                totalBytes: 100
            },
            {
                id: 'taskCancelled',
                percent: 0.9,
                state: NativeModules.RNBackgroundDownload.TaskCanceling,
                bytesWritten: 90,
                totalBytes: 100
            },
            {
                id: 'taskCompletedExplicit',
                state: NativeModules.RNBackgroundDownload.TaskCompleted,
                percent: 1,
                bytesWritten: 100,
                totalBytes: 100
            },
            {
                id: 'taskCompletedImplicit',
                state: NativeModules.RNBackgroundDownload.TaskCompleted,
                percent: 1,
                bytesWritten: 100,
                totalBytes: 100
            },
            {
                id: 'taskFailed',
                state: NativeModules.RNBackgroundDownload.TaskCompleted,
                percent: 0.9,
                bytesWritten: 90,
                totalBytes: 100
            }
        ]
        return Promise.resolve(foundDownloads);
    })
};