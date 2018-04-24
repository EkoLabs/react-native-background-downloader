
package com.eko;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.tonyodev.fetch2.Download;
import com.tonyodev.fetch2.Error;
import com.tonyodev.fetch2.Fetch;
import com.tonyodev.fetch2.FetchListener;
import com.tonyodev.fetch2.Func;
import com.tonyodev.fetch2.NetworkType;
import com.tonyodev.fetch2.Priority;
import com.tonyodev.fetch2.Request;
import com.tonyodev.fetch2.Status;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RNBackgroundDownloadModule extends ReactContextBaseJavaModule implements FetchListener {

  private static final int TASK_RUNNING = 0;
  private static final int TASK_SUSPENDED = 1;
  private static final int TASK_CANCELING = 2;
  private static final int TASK_COMPLETED = 3;

  private static Map<Status, Integer> stateMap = new HashMap<Status, Integer>() {{
    put(Status.DOWNLOADING, TASK_RUNNING);
    put(Status.COMPLETED, TASK_COMPLETED);
    put(Status.PAUSED, TASK_SUSPENDED);
    put(Status.QUEUED, TASK_RUNNING);
    put(Status.CANCELLED, TASK_CANCELING);
    put(Status.FAILED, TASK_CANCELING);
    put(Status.REMOVED, TASK_CANCELING);
    put(Status.DELETED, TASK_CANCELING);
    put(Status.NONE, TASK_CANCELING);
  }};

  private Fetch fetch;
  private Map<String, Integer> idToRequestId = new HashMap<>();
  @SuppressLint("UseSparseArrays")
  private Map<Integer, RNBGDTaskConfig> requestIdToConfig = new HashMap<>();
  private DeviceEventManagerModule.RCTDeviceEventEmitter ee;
  private Date lastProgressReport = new Date();
  private WritableArray progressReports = Arguments.createArray();

  public RNBackgroundDownloadModule(ReactApplicationContext reactContext) {
    super(reactContext);

    loadConfigMap();
    fetch = new Fetch.Builder(this.getReactApplicationContext(), "RNBackgroundDownload")
            .setDownloadConcurrentLimit(4)
            .build();
    fetch.addListener(this);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    fetch.close();
  }

  @Override
  public String getName() {
    return "RNBackgroundDownload";
  }

  @Override
  public void initialize() {
    ee = getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
  }

  @Override
  public boolean hasConstants() {
    return true;
  }

  @Nullable
  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();
    constants.put("documents", this.getReactApplicationContext().getFilesDir().getAbsolutePath());
    constants.put("TaskRunning", TASK_RUNNING);
    constants.put("TaskSuspended", TASK_SUSPENDED);
    constants.put("TaskCanceling", TASK_CANCELING);
    constants.put("TaskCompleted", TASK_COMPLETED);
    constants.put("PriorityHigh", Priority.HIGH.getValue());
    constants.put("PriorityNormal", Priority.NORMAL.getValue());
    constants.put("PriorityLow", Priority.LOW.getValue());
    constants.put("OnlyWifi", NetworkType.WIFI_ONLY.getValue());
    constants.put("AllNetworks", NetworkType.ALL.getValue());
    return  constants;
  }

  private void removeFromMaps(int requestId) {
    RNBGDTaskConfig config = requestIdToConfig.get(requestId);
    if (config != null) {
      idToRequestId.remove(config.id);
      requestIdToConfig.remove(requestId);

      saveConfigMap();
    }
  }

  private void saveConfigMap() {
    File file = new File(this.getReactApplicationContext().getFilesDir(), "RNFileBackgroundDownload_configMap");
    try {
      ObjectOutputStream outputStream = new ObjectOutputStream(new FileOutputStream(file));
      outputStream.writeObject(requestIdToConfig);
      outputStream.flush();
      outputStream.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void loadConfigMap() {
    File file = new File(this.getReactApplicationContext().getFilesDir(), "RNFileBackgroundDownload_configMap");
    try {
      ObjectInputStream inputStream = new ObjectInputStream(new FileInputStream(file));
      requestIdToConfig = (Map<Integer, RNBGDTaskConfig>) inputStream.readObject();
    } catch (IOException | ClassNotFoundException e) {
      e.printStackTrace();
    }
  }

  // JS Methods
  @ReactMethod
  public void download(ReadableMap options) {
    String id = options.getString("id");
    String url = options.getString("url");
    String destination = options.getString("destination");

    if (id == null || url == null || destination == null) {
      Log.e(getName(), "id, url and destination must be set");
      return;
    }

    RNBGDTaskConfig config = new RNBGDTaskConfig(id);
    Request request = new Request(url, destination);
    request.setPriority(options.hasKey("priority") ? Priority.valueOf(options.getInt("priority")) : Priority.NORMAL);
    request.setNetworkType(options.hasKey("network") ? NetworkType.valueOf(options.getInt("network")) : NetworkType.ALL);
    fetch.enqueue(request, null, null);

    idToRequestId.put(id, request.getId());
    requestIdToConfig.put(request.getId(), config);
    saveConfigMap();
  }

  @ReactMethod
  public void puaseTask(String identifier) {
    Integer requestId = idToRequestId.get(identifier);
    if (requestId != null) {
      fetch.pause(requestId);
    }
  }

  @ReactMethod
  public void resumeTask(String identifier) {
    Integer requestId = idToRequestId.get(identifier);
    if (requestId != null) {
      fetch.resume(requestId);
    }
  }

  @ReactMethod
  public void stopTask(String identifier) {
    Integer requestId = idToRequestId.get(identifier);
    if (requestId != null) {
      fetch.cancel(requestId);
    }
  }

  @ReactMethod
  public void checkForExistingDownloads(final Promise promise) {
    fetch.getDownloads(new Func<List<? extends Download>>() {
      @Override
      public void call(List<? extends Download> downloads) {
        WritableArray foundIds = Arguments.createArray();

        for (Download download : downloads) {
          if (requestIdToConfig.containsKey(download.getId())) {
            RNBGDTaskConfig config = requestIdToConfig.get(download.getId());
            WritableMap params = Arguments.createMap();
            params.putString("id", config.id);
            params.putInt("state", stateMap.get(download.getStatus()));
            params.putInt("bytesWritten", (int)download.getDownloaded());
            params.putInt("totalBytes", (int)download.getTotal());
            params.putDouble("percent", ((double)download.getProgress()) / 100);

            foundIds.pushMap(params);

            idToRequestId.put(config.id, download.getId());
            config.reportedBegin = true;
          } else {
            fetch.delete(download.getId());
          }
        }

        promise.resolve(foundIds);
      }
    });
  }

  // Fetch API
  @Override
  public void onQueued(Download download) {

  }

  @Override
  public void onCompleted(Download download) {
    WritableMap params = Arguments.createMap();
    params.putString("id", requestIdToConfig.get(download.getId()).id);
    ee.emit("downloadComplete", params);

    removeFromMaps(download.getId());
    fetch.remove(download.getId());
  }

  @Override
  public void onError(Download download) {
    Error error = download.getError();
    Throwable throwable = error.getThrowable();

    Log.e(getName(), error.toString());
    WritableMap params = Arguments.createMap();
    params.putString("id", requestIdToConfig.get(download.getId()).id);
    if (error == Error.UNKNOWN && throwable != null) {
      params.putString("error", throwable.getLocalizedMessage());
    } else {
      params.putString("error", error.toString());
    }
    ee.emit("downloadFailed", params);

    removeFromMaps(download.getId());
    fetch.remove(download.getId());
  }

  @Override
  public void onProgress(Download download, long l, long l1) {
    RNBGDTaskConfig config = requestIdToConfig.get(download.getId());
    WritableMap params = Arguments.createMap();
    params.putString("id", config.id);

    if (!config.reportedBegin) {
      params.putInt("expctedBytes", (int)download.getTotal());
      ee.emit("downloadBegin", params);
      config.reportedBegin = true;
    } else {
      params.putInt("written", (int)download.getDownloaded());
      params.putInt("total", (int)download.getTotal());
      params.putDouble("percent", ((double)download.getProgress()) / 100);
      progressReports.pushMap(params);
      Date now = new Date();
      if (now.getTime() - lastProgressReport.getTime() > 1500) {
        ee.emit("downloadProgress", progressReports);
        lastProgressReport = now;
        progressReports = Arguments.createArray();
      }
    }

  }

  @Override
  public void onPaused(Download download) {

  }

  @Override
  public void onResumed(Download download) {

  }

  @Override
  public void onCancelled(Download download) {
    removeFromMaps(download.getId());
    fetch.delete(download.getId());
  }

  @Override
  public void onRemoved(Download download) {

  }

  @Override
  public void onDeleted(Download download) {

  }
}