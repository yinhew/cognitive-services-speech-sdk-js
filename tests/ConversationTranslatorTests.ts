// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

// TODO
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as sdk from "../microsoft.cognitiveservices.speech.sdk";
import {
    ConsoleLoggingListener
} from "../src/common.browser/Exports";
import {
    Events,
    EventType,
} from "../src/common/Exports";
import { Settings } from "./Settings";
import WaitForCondition from "./Utilities";

// tslint:disable-next-line:no-console
const consoleInfo = console.info;

const endpointHost: string = Settings.ConversationTranslatorHost;
const speechEndpointHost: string = Settings.ConversationTranslatorSpeechHost;

// tslint:disable-next-line:no-console
console.info = (...args: any[]): void => {

    const formatConsoleDate = (): string => {
        const date = new Date();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();

        return "[" +
               ((hour < 10) ? "0" + hour : hour) +
               ":" +
               ((minutes < 10) ? "0" + minutes : minutes) +
               ":" +
               ((seconds < 10) ? "0" + seconds : seconds) +
               "." +
               ("00" + milliseconds).slice(-3) +
               "] ";
            };
    const timestamp = formatConsoleDate(); //  `[${new Date().toTimeString()}]`;
    consoleInfo.apply(this, [timestamp, args]);
};

let objsToClose: any[];

beforeAll(() => {
    // Override inputs, if necessary
    Settings.LoadSettings();
    Events.instance.attachListener(new ConsoleLoggingListener(EventType.Debug));
    beforeAll(() => jest.setTimeout(90 * 1000));
});

// Test cases are run linearly, the only other mechanism to demark them in the output is to put a console line in each case and
// report the name.
beforeEach(() => {
    objsToClose = [];
    // tslint:disable-next-line:no-console
    console.info("---------------------------------------Starting test case-----------------------------------");
});

afterEach(() => {
    // tslint:disable-next-line:no-console
    console.info("End Time: " + new Date(Date.now()).toLocaleString());
    objsToClose.forEach((value: any, index: number, array: any[]) => {
        if (typeof value.close === "function") {
            value.close();
        }
    });
});

// Conversation tests: begin
describe("conversation constructor tests", () => {

    test("Create Conversation, null constructor", () => {
        expect(() => sdk.Conversation.createConversationAsync(null)).toThrowError();
    });

    test("Create Conversation, undefined constructor", () => {
        expect(() => sdk.Conversation.createConversationAsync(undefined)).toThrowError();
    });
});

describe("conversation config tests", () => {

    test("Create Conversation, config with lang", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        config.speechRecognitionLanguage = "fr-FR";
        config.addTargetLanguage("de-DE");

        const c: sdk.Conversation = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);
        expect(c.speechRecognitionLanguage).not.toBeUndefined();
        expect(c.speechRecognitionLanguage).not.toBeNull();
        expect(c.speechRecognitionLanguage).toEqual("fr-FR");
        expect(c.config.getProperty(sdk.PropertyId[sdk.PropertyId.SpeechServiceConnection_RecoLanguage])).toEqual("fr-FR");
        expect(c.properties.getProperty(sdk.PropertyId[sdk.PropertyId.SpeechServiceConnection_RecoLanguage])).toEqual("fr-FR");
        expect(c.config.targetLanguages.length).toEqual(1);
    });

    test("Create Conversation, config with no lang", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");

        const c: sdk.Conversation = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);
        expect(c.speechRecognitionLanguage).not.toBeUndefined();
        expect(c.speechRecognitionLanguage).not.toBeNull();
        expect(c.speechRecognitionLanguage).toEqual("en-US");
        expect(c.config.getProperty(sdk.PropertyId[sdk.PropertyId.SpeechServiceConnection_RecoLanguage])).toEqual("en-US");
        expect(c.properties.getProperty(sdk.PropertyId[sdk.PropertyId.SpeechServiceConnection_RecoLanguage])).toEqual("en-US");
        expect(c.config.targetLanguages.length).toEqual(1);
    });

    test("Create Conversation, config with endpoint", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);

        expect(c.properties).not.toBeUndefined();
        expect(c.config).not.toBeUndefined();
        expect(c.properties.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host])).toEqual(config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host]));
        expect(c.config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host])).toEqual(config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host]));
        expect(c.properties.getProperty(sdk.PropertyId.ConversationTranslator_SpeechHost)).toEqual(config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost]));
        expect(c.config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost])).toEqual(config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost]));
    });

    test("Create Conversation, config with nickname", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name], "Tester");

        const c = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);
        expect(c.properties).not.toBeUndefined();
        expect(c.config).not.toBeUndefined();
        expect(c.properties.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name])).toEqual(config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name]));
        expect(c.config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name])).toEqual(config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name]));
    });

    test("Create Conversation, config with no nickname", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        const c = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);
        expect(c.properties).not.toBeUndefined();
        expect(c.config).not.toBeUndefined();
        expect(c.properties.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name])).toEqual("Host");
        expect(c.config.getProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name])).toEqual("Host");
    });

    test("Create Conversation, set token property", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        const c = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);
        expect(c.properties).not.toBeUndefined();
        expect(c.config).not.toBeUndefined();

        c.authorizationToken = "12345";
        expect(c.authorizationToken).toEqual("12345");
    });

    test("Create Conversation, set token null property", () => {

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        const c = sdk.Conversation.createConversationAsync(config);
        objsToClose.push(c);
        expect(c.properties).not.toBeUndefined();
        expect(c.config).not.toBeUndefined();

        expect(() => c.authorizationToken = "").toThrowError();
    });

});

describe("conversation service tests", () => {

    test("Start Conversation, valid params", (done: jest.DoneCallback) => {

        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        config.speechRecognitionLanguage = "en-US";
        config.addTargetLanguage("de-DE");
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c = sdk.Conversation.createConversationAsync(config, (() => {
            expect(c.conversationId.length).toEqual(5);
        }));

        objsToClose.push(c);

        WaitForCondition(() => (c.conversationId !== "" && c.conversationId.length === 5), done);

    }, 20000);

    test("Start Conversation, invalid language [400003]", (done: jest.DoneCallback) => {

        let errorMessage: string;
        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        config.speechRecognitionLanguage = "abc";
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c = sdk.Conversation.createConversationAsync(config, undefined, ((error: any) => {
            expect(error).toContain("400003");
            errorMessage = error;
        }));
        objsToClose.push(c);

        WaitForCondition(() => (errorMessage !== undefined), done);

    }, 20000);

    test("Start Conversation, invalid nickname [400025]", (done: jest.DoneCallback) => {

        let errorMessage: string;

        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        config.speechRecognitionLanguage = "en-US";
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }
        config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name], "Host.Testing");

        const c = sdk.Conversation.createConversationAsync(config, undefined, ((error: any) => {
            expect(error).toContain("400025");
            errorMessage = error;
        }));
        objsToClose.push(c);

        WaitForCondition(() => (errorMessage !== undefined), done);

    }, 20000);

    test("Start Conversation, invalid subscription key or region [401000]", (done: jest.DoneCallback) => {

        let errorMessage: string;

        const config = sdk.SpeechTranslationConfig.fromSubscription("abc", "def");
        config.speechRecognitionLanguage = "en-US";
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c = sdk.Conversation.createConversationAsync(config, undefined, ((error: any) => {
            expect(error).toContain("401000");
            errorMessage = error;
        }));
        objsToClose.push(c);

        WaitForCondition(() => (errorMessage !== undefined), done);

    }, 20000);

    test("Start Conversation, join as host and mute participants", (done: jest.DoneCallback) => {

        // tslint:disable-next-line:no-console
        console.info("Start Conversation, join as host, mute participants");

        let commandCount: number = 0;
        let participantsCount: number = 0;
        let isMuted: boolean = true;

        // start a room
        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c: sdk.Conversation = sdk.Conversation.createConversationAsync(config, (() => {
            const ct: sdk.ConversationTranslator = new sdk.ConversationTranslator();
            if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
            if (speechEndpointHost !== "") { ct.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

            ct.canceled = ((s: sdk.ConversationTranslator, e: sdk.ConversationTranslationCanceledEventArgs) => {
                done.fail();
            });
            ct.participantsChanged = ((s: sdk.ConversationTranslator, e: sdk.ConversationParticipantsChangedEventArgs) => {
                if (e.reason === sdk.ParticipantChangedReason.JoinedConversation) {
                    participantsCount++;
                    if (participantsCount === 1) {
                        joinParticipant(c.conversationId);
                    } else {
                        c.muteAllParticipantsAsync();
                    }
                } else if (e.reason === sdk.ParticipantChangedReason.Updated) {
                    commandCount++;
                    if (e.participants.length > 0) {
                        // only the participants should be updated by a mute all command
                        expect(e.participants[0].isMuted).toEqual(isMuted);
                        isMuted = !isMuted;
                        c.unmuteAllParticipantsAsync();
                        done();
                    }
                }
            });

            objsToClose.push(ct);

            c.startConversationAsync(() => {
                ct.joinConversationAsync(c, "Host");
            });
        }),
        ((error: any) => {
            done.fail();
        }));
        objsToClose.push(c);

        function joinParticipant(code: string): void {
            // join as a participant
            const ctP: sdk.ConversationTranslator = new sdk.ConversationTranslator();
            if (endpointHost !== "") { ctP.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
            if (speechEndpointHost !== "") { ctP.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }
            objsToClose.push(ctP);
            ctP.joinConversationAsync(code, "mute me", "en-US");
        }

        WaitForCondition(() => (commandCount > 2), done);

    }, 20000);

    test("Start Conversation, join as host and send message", (done: jest.DoneCallback) => {

        // tslint:disable-next-line:no-console
        console.info("Start Conversation, join as host and send message");

        let textMessage: string = "";

        // start a room
        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c: sdk.Conversation = sdk.Conversation.createConversationAsync(config, (() => {
            objsToClose.push(c);

            const ct: sdk.ConversationTranslator = new sdk.ConversationTranslator();
            if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
            if (speechEndpointHost !== "") { ct.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

            ct.canceled = ((s: sdk.ConversationTranslator, e: sdk.ConversationTranslationCanceledEventArgs) => {
                done.fail();
            });
            ct.participantsChanged = ((s: sdk.ConversationTranslator, e: sdk.ConversationParticipantsChangedEventArgs) => {
                sendMessage(`Hello ${e.participants[0].displayName}`);
            });
            ct.textMessageReceived = ((s: sdk.ConversationTranslator, e: sdk.ConversationTranslationEventArgs) => {
                // tslint:disable-next-line: no-console
                // console.log("received message: " + e.result.text);
                textMessage = e.result.text;
            });

            function sendMessage(message: string): void {
                ct.sendTextMessageAsync(message);
                done();
            }

            objsToClose.push(ct);

            c.startConversationAsync(() => {
                ct.joinConversationAsync(c, "Host");
            });

        }),
        ((error: any) => {
            done.fail();
        }));

        WaitForCondition(() => (textMessage !== ""), done);

    }, 20000);

    // test("Start Conversation, join as host with speech language and speak", (done: jest.DoneCallback) => {

    //     // tslint:disable-next-line:no-console
    //     console.info("Start Conversation, join as host with speech language and speak");

    //     let audioStopped: boolean = false;

    //     // start a room
    //     const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
    //     if (endpointHost !== "") { config.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
    //     if (speechEndpointHost !== "") { config.setProperty("ConversationTranslator_SpeechHost", speechEndpointHost); }

    //     const c: sdk.Conversation = sdk.Conversation.createConversationAsync(config);
    //     objsToClose.push(c);

    //     const ct: sdk.ConversationTranslator = new sdk.ConversationTranslator();
    //     if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
    //     if (speechEndpointHost !== "") { ct.properties.setProperty("ConversationTranslator_SpeechHost", speechEndpointHost); }

    //     ct.canceled = ((s: sdk.ConversationTranslator, e: sdk.ConversationTranslationCanceledEventArgs) => {
    //         // TODO: need to use non-mic input as the web audio is not supported here
    //         expect(e.errorDetails).toContain("Browser");
    //         audioStopped = true;
    //         done();
    //     });
    //     ct.participantsChanged = ((s: sdk.ConversationTranslator, e: sdk.ConversationParticipantsChangedEventArgs) => {
    //         setTimeout(startSpeaking, 100);
    //     });

    //     objsToClose.push(ct);

    //     function startSpeaking(): void {
    //         // connect to the speech socket
    //         ct.startTranscribingAsync();
    //         setTimeout(stopSpeaking, 1000);
    //     }

    //     function stopSpeaking(): void {
    //         // connect to the speech socket
    //         ct.stopTranscribingAsync();
    //     }

    //     c.startConversationAsync(() => {
    //         ct.joinConversationAsync(c, "Host");
    //     });

    //     WaitForCondition(() => (audioStopped), done);

    // }, 20000);

    test("Start Conversation, join as host and eject participant", (done: jest.DoneCallback) => {

        // tslint:disable-next-line:no-console
        console.info("Start Conversation, join as host and eject participant");

        let participantsCount: number = 0;
        let participantId: string = "";
        let ejected: number = 0;

        // start a room
        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c: sdk.Conversation = sdk.Conversation.createConversationAsync(config, (() => {
            objsToClose.push(c);

            const ct: sdk.ConversationTranslator = new sdk.ConversationTranslator();
            if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
            if (speechEndpointHost !== "") { ct.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }
            ct.canceled = ((s: sdk.ConversationTranslator, e: sdk.ConversationTranslationCanceledEventArgs) => {
                done.fail();
            });
            ct.participantsChanged = ((s: sdk.ConversationTranslator, e: sdk.ConversationParticipantsChangedEventArgs) => {
                if (e.reason === sdk.ParticipantChangedReason.JoinedConversation) {
                    participantsCount++;
                    if (participantsCount === 1) {
                        // the host has joined
                        joinParticipant(c.conversationId);
                    } else {
                        // a participant is joining
                        participantId = e.participants[0].id;
                        eject(participantId);
                    }
                } else if (e.reason === sdk.ParticipantChangedReason.LeftConversation) {
                    expect(e.participants[0].id).toEqual(participantId);
                    ejected++;
                }
            });

            objsToClose.push(ct);

            function eject(id: string): void {
                c.removeParticipantAsync(participantId);
            }

            c.startConversationAsync(() => {
                ct.joinConversationAsync(c, "Host");
            });
        }),
        ((error: any) => {
            done.fail();
        }));

        function joinParticipant(code: string): void {
            // join as a participant
            const ctP: sdk.ConversationTranslator = new sdk.ConversationTranslator();
            if (endpointHost !== "") { ctP.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
            if (speechEndpointHost !== "") { ctP.properties.setProperty(sdk.PropertyId.ConversationTranslator_SpeechHost, speechEndpointHost); }
            ctP.joinConversationAsync(code, "remove me", "en-US");
        }

        WaitForCondition(() => (ejected > 0), done);

    }, 30000);

    // test("Start Conversation, then delete it", (done: jest.DoneCallback) => {

    //     const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
    //     config.speechRecognitionLanguage = "en-US";
    //     config.addTargetLanguage("de-DE");
    //     if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
    //     if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

    //     const c = sdk.Conversation.createConversationAsync(config);
    //     objsToClose.push(c);

    //     c.startConversationAsync();

    //     WaitForCondition(() => {
    //         return !!c.conversationId;
    //     }, () => {

    //         expect(c.config).not.toBeUndefined();
    //         c.endConversationAsync();
    //         c.deleteConversationAsync();

    //         WaitForCondition(() => {
    //             return c.config === undefined;
    //         }, () => {
    //             done();
    //         });
    //     });

    // }, 30000);

});

// Conversation Translator tests: begin
describe("conversation translator constructor tests", () => {

    test("Create Conversation Translator, empty constructor", () => {
        expect(() => new sdk.ConversationTranslator()).not.toBeUndefined();
    });

    test("Create Conversation Translator, null constructor", () => {
        expect(() => new sdk.ConversationTranslator(null)).not.toBeUndefined();
    });

    test("Create Conversation Translator, undefined constructor", () => {
        expect(() => new sdk.ConversationTranslator(undefined)).not.toBeUndefined();
    });

    test("Create Conversation Translator, empty constructor", () => {
        expect(() => new sdk.ConversationTranslator()).not.toBeUndefined();
    });
});

describe("conversation translator config tests", () => {

    test("Create Conversation Translator, audio config", () => {

        const audioConfig  = sdk.AudioConfig.fromDefaultMicrophoneInput();
        const ct = new sdk.ConversationTranslator(audioConfig);
        objsToClose.push(ct);

        expect(ct.properties).not.toBeUndefined();
    });

});

describe("conversation translator service tests",  () => {

    test("Join Conversation Translator, invalid conversation code [400027]", (done: jest.DoneCallback) => {

        // tslint:disable-next-line:no-console
        console.info("Join Conversation Translator, invalid conversation code [400027]");

        const audioConfig  = sdk.AudioConfig.fromDefaultMicrophoneInput();
        const ct = new sdk.ConversationTranslator(audioConfig);
        const code: string = "abcde";
        const lang: string = "en-US";
        const nickname: string = "Tester";

        if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
        if (speechEndpointHost !== "") { ct.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        objsToClose.push(ct);

        let errorMessage: string;

        ct.joinConversationAsync(code, nickname, lang,
            undefined,
            ((error: any) => {
                expect(error).toContain("400027");
                errorMessage = error;
            }));

        WaitForCondition(() => (errorMessage !== undefined), done);

    });

    test("Join Conversation Translator, duplicate nickname [400028]", (done: jest.DoneCallback) => {

        // tslint:disable-next-line:no-console
        console.info("Join Conversation Translator, duplicate nickname [400028]");

        let errorMessage: string = "";

        // start a room
        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }
        config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Name], "Tester");

        const c = sdk.Conversation.createConversationAsync(config, (() => {

            c.startConversationAsync((() => {

                const ct = new sdk.ConversationTranslator();
                if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
                if (speechEndpointHost !== "") { ct.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

                objsToClose.push(ct);

                const nickname: string = "Tester";
                const lang: string = "en-US";

                ct.joinConversationAsync(c.conversationId, nickname, lang,
                    (() => {
                        done();
                    }),
                    ((error: any) => {
                        expect(error).toContain("400028");
                        errorMessage = error;
                    }));
            }),
            ((error: any) => {
                done.fail();
            }));

        }),
        ((error: any) => {
            done.fail();
        }));

        objsToClose.push(c);

        WaitForCondition(() => (errorMessage !== ""), done);

    }, 20000);

    test("Join Conversation Translator, locked room [400044]", (done: jest.DoneCallback) => {

        // tslint:disable-next-line:no-console
        console.info("Join Conversation Translator, locked room [400044]");

        // start a room
        const config = sdk.SpeechTranslationConfig.fromSubscription(Settings.SpeechSubscriptionKey, Settings.SpeechRegion);
        if (endpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_Host], endpointHost); }
        if (speechEndpointHost !== "") { config.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

        const c = sdk.Conversation.createConversationAsync(config, (() => {
            objsToClose.push(c);

            const ct = new sdk.ConversationTranslator();
            if (endpointHost !== "") { ct.properties.setProperty(sdk.PropertyId.ConversationTranslator_Host, endpointHost); }
            if (speechEndpointHost !== "") { ct.properties.setProperty(sdk.PropertyId[sdk.PropertyId.ConversationTranslator_SpeechHost], speechEndpointHost); }

            objsToClose.push(ct);

            const nickname: string = "Tester";
            const lang: string = "en-US";
            let errorMessage: string = "";

            c.startConversationAsync(() => {
                c.lockConversationAsync();
                ct.joinConversationAsync(c.conversationId, nickname, lang,
                    (() => {
                        done();
                    }),
                    ((error: any) => {
                        expect(error).toContain("400044");
                        errorMessage = error;
                    }));
            });

            WaitForCondition(() => (errorMessage !== ""), done);
        }));
    }, 20000);

});