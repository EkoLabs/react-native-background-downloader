import { NativeModules } from 'react-native';
const { RNBackgroundDownloader } = NativeModules;

function validateHandler(handler) {
    if (!(typeof handler === 'function')) {
        throw new TypeError(`[RNBackgroundDownloader] expected argument to be a function, got: ${typeof handler}`);
    }
}
export default class DownloadTask {
    state = 'PENDING'
    percent = 0
    bytesWritten = 0
    totalBytes = 0

    constructor(taskInfo) {
        if (typeof taskInfo === 'string') {
            this.id = taskInfo;
        } else {
            this.id = taskInfo.id;
            this.percent = taskInfo.percent;
            this.bytesWritten = taskInfo.bytesWritten;
            this.totalBytes = taskInfo.totalBytes;
        }
    }

    begin(handler) {
        validateHandler(handler);
        this._beginHandler = handler;
        return this;
    }

    progress(handler) {
        validateHandler(handler);
        this._progressHandler = handler;
        return this;
    }

    done(handler) {
        validateHandler(handler);
        this._doneHandler = handler;
        return this;
    }

    error(handler) {
        validateHandler(handler);
        this._errorHandler = handler;
        return this;
    }

    _onBegin(expectedBytes) {
        this.state = 'DOWNLOADING';
        if (this._beginHandler) {
            this._beginHandler(expectedBytes);
        }
    }

    _onProgress(percent, bytesWritten, totalBytes) {
        this.percent = percent;
        this.bytesWritten = bytesWritten;
        this.totalBytes = totalBytes;
        if (this._progressHandler) {
            this._progressHandler(percent, bytesWritten, totalBytes);
        }
    }

    _onDone() {
        this.state = 'DONE';
        if (this._doneHandler) {
            this._doneHandler();
        }
    }

    _onError(error, errorCode) {
        this.state = 'FAILED';
        if (this._errorHandler) {
            this._errorHandler(error, errorCode);
        }
    }

    pause() {
        this.state = 'PAUSED';
        RNBackgroundDownloader.pauseTask(this.id);
    }

    resume() {
        this.state = 'DOWNLOADING';
        RNBackgroundDownloader.resumeTask(this.id);
    }

    stop() {
        this.state = 'STOPPED';
        RNBackgroundDownloader.stopTask(this.id);
    }
}
