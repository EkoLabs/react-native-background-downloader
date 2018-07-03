import { NativeModules, NativeEventEmitter } from 'react-native';
const { RNBackgroundDownload } = NativeModules;
const RNBackgroundDownloadEmitter = new NativeEventEmitter(RNBackgroundDownload);
import DownloadTask from './lib/downloadTask';

const tasksMap = new Map();

RNBackgroundDownloadEmitter.addListener('downloadProgress', events => {
    for (let event of events) {
        let task = tasksMap.get(event.id);
        if (task) {
            task._onProgress(event.percent, event.written, event.total);
        }
    }
});

RNBackgroundDownloadEmitter.addListener('downloadComplete', event => {
    let task = tasksMap.get(event.id);
    if (task) {
        task._onDone(event.location);
    }
    tasksMap.delete(event.id);
});

RNBackgroundDownloadEmitter.addListener('downloadFailed', event => {
    let task = tasksMap.get(event.id);
    if (task) {
        task._onError(event.error);
    }
    tasksMap.delete(event.id);
});

RNBackgroundDownloadEmitter.addListener('downloadBegin', event => {
    let task = tasksMap.get(event.id);
    if (task) {
        task._onBegin(event.expectedBytes);
    }
});

export function checkForExistingDownloads() {
    return RNBackgroundDownload.checkForExistingDownloads()
        .then(foundTasks => {
            return foundTasks.map(taskInfo => {
                let task = new DownloadTask(taskInfo);
                if (taskInfo.state === RNBackgroundDownload.TaskRunning) {
                    task.state = 'DOWNLOADING';
                } else if (taskInfo.state === RNBackgroundDownload.TaskSuspended) {
                    task.state = 'PAUSED';
                } else if (taskInfo.state === RNBackgroundDownload.TaskCanceling) {
                    task.stop();
                    return null;
                } else if (taskInfo.state === RNBackgroundDownload.TaskCompleted) {
                    if (taskInfo.bytesWritten === taskInfo.totalBytes) {
                        task.state = 'DONE';
                    } else {
                        // IOS completed the download but it was not done.
                        return null;
                    }
                }
                tasksMap.set(taskInfo.id, task);
                return task;
            }).filter(task => task !== null);
        });
}

export function download(options) {
    if (!options.id || !options.url || !options.destination) {
        throw new Error('[RNBackgroundDownload] id, url and destination are required');
    }
    RNBackgroundDownload.download(options);
    let task = new DownloadTask(options.id);
    tasksMap.set(options.id, task);
    return task;
}

export const directories = {
    documents: RNBackgroundDownload.documents
};

export const Network = {
    WIFI_ONLY: RNBackgroundDownload.OnlyWifi,
    ALL: RNBackgroundDownload.AllNetworks
};

export const Priority = {
    HIGH: RNBackgroundDownload.PriorityHigh,
    MEDIUM: RNBackgroundDownload.PriorityNormal,
    LOW: RNBackgroundDownload.PriorityLow
};

export default {
    download,
    checkForExistingDownloads,
    directories,
    Network,
    Priority
};
