import { NativeModules } from 'react-native';
const { RNBackgroundDownload } = NativeModules;

export default class DownloadTask {
    state = 'PENDING';
    percent = 0;
    bytesWritten = 0;
    totalBytes = 0;

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
        this._beginHandler = handler;
        return this;
    }

    progress(handler) {
        this._progressHandler = handler;
        return this;
    }

    done(handler) {
        this._doneHandler = handler;
        return this;
    }

    error(handler) {
        this._errorHandler = handler;
        return this;
    }

    _onBegin(expectedBytes) {
        this.state = 'DOWNLOADING';
        this._beginHandler && this._beginHandler(expectedBytes);
    }

    _onProgress(percent, bytesWritten, totalBytes) {
        this.percent = percent;
        this.bytesWritten = bytesWritten;
        this.totalBytes = totalBytes;
        this._progressHandler && this._progressHandler(percent, bytesWritten, totalBytes);
    }

    _onDone() {
        this.state = 'DONE';
        this._doneHandler && this._doneHandler();
    }

    _onError(error) {
        this.state = 'FAILED';
        this._errorHandler && this._errorHandler(error);
    }

    pause() {
        this.state = 'PAUSED';
        RNBackgroundDownload.pauseTask(this.id);
    }

    resume() {
        this.state = 'DOWNLOADING';
        RNBackgroundDownload.resumeTask(this.id);
    }

    stop() {
        this.state = 'STOPPED';
        RNBackgroundDownload.stopTask(this.id);
    }
}