//
//  TaskConfig.h
//  EkoApp
//
//  Created by Elad Gil on 21/11/2017.
//  Copyright © 2017 Eko. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RNBGDTaskConfig : NSObject <NSCoding>

@property NSString * _Nonnull id;
@property NSString * _Nonnull destination;
@property BOOL reportedBegin;

- (id _Nullable )initWithDictionary: (NSDictionary *_Nonnull)dict;

@end

@implementation RNBGDTaskConfig

- (id _Nullable )initWithDictionary: (NSDictionary *_Nonnull)dict {
    self = [super init];
    if (self) {
        self.id = dict[@"id"];
        self.destination = dict[@"destination"];
        self.reportedBegin = NO;
    }
    
    return self;
}

- (void)encodeWithCoder:(nonnull NSCoder *)aCoder {
    [aCoder encodeObject:self.id forKey:@"id"];
    [aCoder encodeObject:self.destination forKey:@"destination"];
    [aCoder encodeBool:self.reportedBegin forKey:@"reportedBegin"];
}

- (nullable instancetype)initWithCoder:(nonnull NSCoder *)aDecoder {
    self = [super init];
    if (self) {
        self.id = [aDecoder decodeObjectForKey:@"id"];
        self.destination = [aDecoder decodeObjectForKey:@"destination"];
        self.reportedBegin = [aDecoder decodeBoolForKey:@"reportedBegin"];
    }
    
    return self;
}

@end
