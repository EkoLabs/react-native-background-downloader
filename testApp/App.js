/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Text, SafeAreaView, TextInput, Button, FlatList, View, AsyncStorage, TouchableOpacity, Slider } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import produce from 'immer';
import RNBGD from '../index';
import styles from './Style';

const testURL = 'https://speed.hetzner.de/100MB.bin';
const urlRegex = /^(?:https?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

function isValid(url) {
    return urlRegex.test(url);
}

export default class App extends Component {
    constructor(props) {
        super(props);
        this.idsToData = {};
    }

    state = {
        url: '',
        status: 'idle',
        percent: 0,
        downloads: [],
        downloadsData: {},
    };

    async componentDidMount() {
        const tasks = await RNBGD.checkForExistingDownloads();
        if (tasks && tasks.length) {
            await this.loadDownloads();
            const downloadsData = {};
            const downloads = [];
            for (let task of tasks) {
                downloads.push(task.id);
                downloadsData[task.id] = {
                    url: this.idsToData[task.id].url,
                    percent: task.percent,
                    total: task.totalBytes,
                    status: task.state === 'DOWNLOADING' ? 'downloading' : 'paused',
                    task: task
                };
                this.attachToTask(task, this.idsToData[task.id].filePath);
            }
            this.setState({
                downloadsData,
                downloads
            });
        }
    }

    saveDownloads() {
        AsyncStorage.setItem('idsToData', JSON.stringify(this.idsToData));
    }

    async loadDownloads() {
        const mapStr = await AsyncStorage.getItem('idsToData');
        try {
            this.idsToData = JSON.parse(mapStr);
        } catch (e) {
            console.error(e);
        }
    }

    pauseOrResume(id) {
        let newStatus;
        const download = this.state.downloadsData[id];
        if (download.status === 'downloading') {
            download.task.pause();
            newStatus = 'paused';
        } else if (download.status === 'paused') {
            download.task.resume();
            newStatus = 'downloading';
        } else {
            console.error(`Unknown status for play or pause: ${download.status}`);
            return;
        }

        this.setState(produce(draft => {
            draft.downloadsData[id].status = newStatus;
        }));
    }

    cancel(id) {
        const download = this.state.downloadsData[id];
        download.task.stop();
        delete this.idsToData[id];
        this.saveDownloads();
        this.setState(produce(draft => {
            delete draft.downloadsData[id];
            draft.downloads.splice(draft.downloads.indexOf(id), 1);
        }));
    }

    renderRow({ item: downloadId }) {
        const download = this.state.downloadsData[downloadId];
        let iconName = 'ios-pause';
        if (download.status === 'paused') {
            iconName = 'ios-play';
        }

        return (
            <View key={downloadId} style={styles.downloadItem}>
                <View style={{flex: 1}}>
                    <View>
                        <Text>{downloadId}</Text>
                        <Text>{download.url}</Text>
                    </View>
                    <Slider
                        value={download.percent}
                        disabled
                    />
                </View>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => this.pauseOrResume(downloadId)}>
                        <Icon name={iconName} size={26}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.cancel(downloadId)}>
                        <Icon name="ios-close" size={40}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    attachToTask(task, filePath) {
        task.begin(expectedBytes => {
                this.setState(produce(draft => {
                    draft.downloadsData[task.id].total = expectedBytes;
                    draft.downloadsData[task.id].status = 'downloading';
                }));
            })
            .progress(percent => {
                this.setState(produce(draft => {
                    draft.downloadsData[task.id].percent = percent;
                }));
            })
            .done(async() => {
                try {
                    console.log(`Finished downloading: ${task.id}, deleting it...`);
                    await RNFS.unlink(filePath);
                    console.log(`Deleted ${task.id}`);
                } catch (e) {
                    console.error(e);
                }
                delete this.idsToData[task.id];
                this.saveDownloads();
                this.setState(produce(draft => {
                    delete draft.downloadsData[task.id];
                    draft.downloads.splice(draft.downloads.indexOf(task.id), 1);
                }));
            })
            .error(err => {
                console.error(`Download ${task.id} has an error: ${err}`);
                delete this.idsToData[task.id];
                this.saveDownloads();
                this.setState(produce(draft => {
                    delete draft.downloadsData[task.id];
                    draft.downloads.splice(draft.downloads.indexOf(task.id), 1);
                }));
            });
    }

    addDownload() {
        const id = Math.random()
            .toString(36)
            .substr(2, 6);
        const filePath = `${RNBGD.directories.documents}/${id}`;
        const url = this.state.url || `${testURL}?${id}`;
        const task = RNBGD.download({
            id: id,
            url: url,
            destination: filePath,
        });
        this.attachToTask(task, filePath);
        this.idsToData[id] = {
            url,
            filePath
        };
        this.saveDownloads();

        this.setState(produce(draft => {
            draft.downloadsData[id] = {
                url: url,
                status: 'idle',
                task: task
            };
            draft.downloads.push(id);
            draft.url = '';
        }));
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <TextInput
                    style={styles.textInput}
                    textContentType="none"
                    autoCorrect={false}
                    multiline={true}
                    keyboardType="url"
                    placeholder={testURL}
                    onChangeText={(text) => {
                        this.setState({ url: text.toLowerCase() });
                    }}
                    value={this.state.url}
                />
                <Button
                    title="Add Download"
                    onPress={this.addDownload.bind(this)}
                    disabled={this.state.url !== '' && !isValid(this.state.url)}
                />
                <FlatList
                    style={styles.downloadingList}
                    data={this.state.downloads}
                    renderItem={this.renderRow.bind(this)}
                    extraData={this.state.downloadsData}
                />
            </SafeAreaView>
        );
    }
}
