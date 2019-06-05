/**
 * Created by juanjimenez on 07/12/2016.
 * Otomogroove ltd 2017
 */

"use strict";
import React, { PureComponent } from "react";
import {
  Platform,
  processColor,
  DeviceEventEmitter,
  requireNativeComponent,
  NativeModules
} from "react-native";

import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

type StateType = { componentID: string };

export const { OGWaveManager } = NativeModules;

export default class WaveForm extends PureComponent<
  WaveObjectPropsType,
  StateType
> {
  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this);
    this._onFinishPlay = this._onFinishPlay.bind(this);
    this._onWaveformLoaded = this._onWaveformLoaded.bind(this);
  }

  _makeid() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  _onPress(e) {
    const event = Platform.OS === "ios" ? e.nativeEvent : e;
    if (event.componentID === this.state.componentID && this.props.onPress) {
      this.props.onPress(event);
    }
  }

  _onFinishPlay(e) {
    const event = Platform.OS === "ios" ? e.nativeEvent : e;
    if (
      event.componentID === this.state.componentID &&
      this.props.onFinishPlay
    ) {
      this.props.onFinishPlay(event);
    }
  }

  _onWaveformLoaded(e) {
    this.props.onWaveformLoaded(e);
  }

  componentWillMount() {
    DeviceEventEmitter.addListener("OGOnPress", this._onPress);
    DeviceEventEmitter.addListener("OGFinishPlay", this._onFinishPlay);
    DeviceEventEmitter.addListener("waveformLoaded", this._onWaveformLoaded);
    const componentID = this._makeid();
    this.setState({ componentID });
  }

  render() {
    const { source } = this.props;
    const { componentID } = this.state;
    const assetResoved = resolveAssetSource(source) || {};

    let uri = assetResoved.uri;
    if (uri && uri.match(/^\//)) {
      uri = `${uri}`;
    }

    const isNetwork = !!(uri && uri.match(/^https?:/));
    const isAsset = !!(
      uri && uri.match(/^(assets-library|file|content|ms-appx|ms-appdata):/)
    );

    const nativeProps = {
      ...this.props,
      waveFormStyle: {
        ogWaveColor: processColor(this.props.waveFormStyle.waveColor),
        ogScrubColor: processColor(this.props.waveFormStyle.scrubColor),
        ogTimeOffsetStart: this.props.waveFormStyle.offsetStart,
        ogTimeOffsetEnd: this.props.waveFormStyle.offsetEnd
      },

      src: {
        uri,
        isNetwork,
        isAsset,
        type: source.type,
        mainVer: source.mainVer || 0,
        patchVer: source.patchVer || 0
      },
      componentID
    };

    return (
      <OGWaverformView
        {...nativeProps}
        onPress={this._onPress}
        onFinishPlay={this._onFinishPlay}
        onWaveformLoaded={this._onWaveformLoaded}
      />
    );
  }
}

const OGWaverformView = requireNativeComponent("OGWave", WaveForm);
