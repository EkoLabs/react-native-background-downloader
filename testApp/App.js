/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, SafeAreaView, TextInput, Button } from 'react-native';
import RNBGD from '../index';

const testURL = 'https://speed.hetzner.de/100MB.bin';
const urlRegex = /^(?:https?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

function isValid(url) {
    return urlRegex.test(url);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        paddingHorizontal: 10
    },
    textInput: {
        height: 70,
        width: 300,
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10
    }
});

export default class App extends Component {
  state = {
      url: '',
      status: 'idle',
      percent: 0
  };

  handleClick() {
      if (this.state.status === 'idle') {
          this.downloadTask = RNBGD.download({
              id: 'task',
              url: this.state.url || testURL,
              destination: `${RNBGD.directories.documents}/file`
          }).begin(expectedBytes => {
              this.setState({ totalBytes: expectedBytes });
          })
              .progress(percent => {
                  this.setState({ percent });
              })
              .done(() => {
                  this.setState({ status: 'idle', percent: 0 });
              })
              .error(err => {
                  console.log(err);
                  this.setState({ status: 'idle', percent: 0 });
              });

          this.setState({ status: 'downloading' });
      } else if (this.state.status === 'downloading') {
          this.downloadTask.pause();
          this.setState({ status: 'paused' });
      } else if (this.state.status === 'paused') {
          this.downloadTask.resume();
          this.setState({ status: 'downloading' });
      }
  }

  render() {
      let buttonLabel = 'Download';
      if (this.state.status === 'downloading') {
          buttonLabel = 'Pause';
      } else if (this.state.status === 'paused') {
          buttonLabel = 'Resume';
      }

      return (
          <SafeAreaView style={styles.container}>
              <TextInput
                  style={styles.textInput}
                  textContentType="none"
                  autoCorrect={false}
                  multiline={true}
                  keyboardType="url"
                  placeholder={testURL}
                  onChangeText={(text) => { this.setState({ url: text.toLowerCase() }); }}
                  value={this.state.url}
              />
              <Button
                  title={buttonLabel}
                  onPress={this.handleClick.bind(this)}
                  disabled={this.state.url !== '' && !isValid(this.state.url)}
              />
              <Text>Status: {this.state.status}</Text>
              <Text>Downloading: {this.state.percent * 100}%</Text>
          </SafeAreaView>
      );
  }
}
