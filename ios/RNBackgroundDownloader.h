//
//  RNFileBackgroundDownload.h
//  EkoApp
//
//  Created by Elad Gil on 20/11/2017.
//  Copyright © 2017 Eko. All rights reserved.
//
//
#import <Foundation/Foundation.h>
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#endif

typedef void (^CompletionHandler)();

@interface RNBackgroundDownloader : RCTEventEmitter <RCTBridgeModule, NSURLSessionDelegate, NSURLSessionDownloadDelegate>

+ (void)setCompletionHandlerWithIdentifier: (NSString *)identifier completionHandler: (CompletionHandler)completionHandler;

@end
