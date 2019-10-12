import { NativeModules, NativeEventEmitter } from 'react-native';
const { RNBackgroundDownloader } = NativeModules;
const RNBackgroundDownloaderEmitter = new NativeEventEmitter(RNBackgroundDownloader);
import DownloadTask from './lib/downloadTask';

const tasksMap = new Map();
let headers = {};

RNBackgroundDownloaderEmitter.addListener('downloadProgress', events => {
    for (let event of events) {
        let task = tasksMap.get(event.id);
        if (task) {
            task._onProgress(event.percent, event.written, event.total);
        }
    }
});

RNBackgroundDownloaderEmitter.addListener('downloadComplete', event => {
    let task = tasksMap.get(event.id);
    if (task) {
        task._onDone(event.location);
    }
    tasksMap.delete(event.id);
});

RNBackgroundDownloaderEmitter.addListener('downloadFailed', event => {
    let task = tasksMap.get(event.id);
    if (task) {
        task._onError(event.error, event.errorcode);
    }
    tasksMap.delete(event.id);
});

RNBackgroundDownloaderEmitter.addListener('downloadBegin', event => {
    let task = tasksMap.get(event.id);
    if (task) {
        task._onBegin(event.expectedBytes);
    }
});

export function setHeaders(h = {}) {
    if (typeof h !== 'object') {
        throw new Error('[RNBackgroundDownloader] headers must be an object');
    }
    headers = h;
}

export function checkForExistingDownloads() {
    return RNBackgroundDownloader.checkForExistingDownloads()
        .then(foundTasks => {
            return foundTasks.map(taskInfo => {
                let task = new DownloadTask(taskInfo);
                if (taskInfo.state === RNBackgroundDownloader.TaskRunning) {
                    task.state = 'DOWNLOADING';
                } else if (taskInfo.state === RNBackgroundDownloader.TaskSuspended) {
                    task.state = 'PAUSED';
                } else if (taskInfo.state === RNBackgroundDownloader.TaskCanceling) {
                    task.stop();
                    return null;
                } else if (taskInfo.state === RNBackgroundDownloader.TaskCompleted) {
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
        throw new Error('[RNBackgroundDownloader] id, url and destination are required');
    }
    if (options.headers && typeof options.headers === 'object') {
        options.headers = {
            ...headers,
            ...options.headers
        };
    } else {
        options.headers = headers;
    }
    RNBackgroundDownloader.download(options);
    let task = new DownloadTask(options.id);
    tasksMap.set(options.id, task);
    return task;
}

export const directories = {
    documents: RNBackgroundDownloader.documents
};

export const Network = {
    WIFI_ONLY: RNBackgroundDownloader.OnlyWifi,
    ALL: RNBackgroundDownloader.AllNetworks
};

export const Priority = {
    HIGH: RNBackgroundDownloader.PriorityHigh,
    MEDIUM: RNBackgroundDownloader.PriorityNormal,
    LOW: RNBackgroundDownloader.PriorityLow
};

export default {
    download,
    checkForExistingDownloads,
    setHeaders,
    directories,
    Network,
    Priority
};
