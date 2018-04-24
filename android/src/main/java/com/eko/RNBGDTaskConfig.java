package com.eko;

import java.io.Serializable;

public class RNBGDTaskConfig implements Serializable {
    public String id;
    public boolean reportedBegin;

    public TaskConfig(String id) {
        this.id = id;
        this.reportedBegin = false;
    }
}