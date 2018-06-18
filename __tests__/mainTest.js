import RNBackgroundDownload from '../index';
import DownloadTask from '../lib/downloadTask';

test('download should return a downloadTask', () => {
    expect(RNBackgroundDownload.download({
        id: 'test',
        url: 'test',
        destination: 'test'
    })).toBeInstanceOf(DownloadTask);
});