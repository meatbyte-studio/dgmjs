import * as Y from "yjs";
import { WebrtcProvider } from "@dgmjs/y-webrtc";
import { Editor, TypedEvent } from "@dgmjs/core";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import {
  UserIdentity,
  YjsDocSyncPlugin,
  YjsUserPresencePlugin,
} from "@dgmjs/dgmjs-plugin-yjs";

export const UserColors = [
  "#E54D2E",
  "#E54666",
  "#E54666",
  "#8E4EC6",
  "#6E56CF",
  "#3E63DD",
  "#0090FF",
  "#00A2C7",
  "#12A594",
  "#30A46C",
  "#46A758",
  "#A18072",
  "#A18072",
  "#F76B15",
  "#BDEE63",
  "#86EAD4",
  "#7CE2FE",
];

export function generateUserIdentity(): UserIdentity {
  const name = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: " ",
  });
  const color = UserColors[Math.round(Math.random() * UserColors.length - 1)];
  return {
    name,
    color,
  };
}

export class Collab {
  editor: Editor = null!;
  docSyncPlugin: YjsDocSyncPlugin = null!;
  userPresencePlugin: YjsUserPresencePlugin = null!;
  yDoc: Y.Doc | null;
  yProvider: WebrtcProvider | null;
  syncStarted: boolean;
  oDocReady: TypedEvent<void>;
  signalingUrls: string[] = [];
  signalingPassword: string = "";

  constructor() {
    this.yDoc = null;
    this.yProvider = null;
    this.syncStarted = false;
    this.oDocReady = new TypedEvent();
  }

  autoDetermineSignalingUrl() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const port =
      window.location.protocol === "https:" ? "" : `:${window.location.port}`;
    this.signalingUrls = [`${protocol}://${window.location.hostname}${port}`];
  }

  setSignalingUrl(signalingUrl: string) {
    if (signalingUrl === "*") {
      this.autoDetermineSignalingUrl();
    } else {
      this.signalingUrls = [signalingUrl];
    }
  }

  setSignalingPassword(signalingPassword: string) {
    this.signalingPassword = signalingPassword;
  }

  start(editor: Editor, roomId: string, userIdentity: UserIdentity) {
    this.editor = editor;
    this.docSyncPlugin = this.editor.getPlugin(
      "dgmjs/yjs-doc-sync"
    ) as YjsDocSyncPlugin;
    this.userPresencePlugin = this.editor.getPlugin(
      "dgmjs/yjs-user-presence"
    ) as YjsUserPresencePlugin;

    // initialize yDoc
    this.syncStarted = true;
    this.yDoc = new Y.Doc();
    this.yDoc.on("update", (update) => {
      if (this.syncStarted) {
        this.syncStarted = false;
        this.oDocReady.emit();
      }
    });

    this.yProvider = new WebrtcProvider(roomId, this.yDoc, {
      signaling: this.signalingUrls,
      password: this.signalingPassword,
    });

    this.docSyncPlugin.start(this.yDoc);
    this.userPresencePlugin.start(this.yProvider.awareness, userIdentity);
    this.userPresencePlugin.onUserEnter.addListener((users) => {
      // console.log("user enter", users);
    });
    this.userPresencePlugin.onUserLeave.addListener((users) => {
      // console.log("user leave", users);
    });
    this.userPresencePlugin.onUserIdentityUpdate.addListener((users) => {
      // console.log("user update", users);
    });
  }

  updateUserIdentity(userIdentity: UserIdentity) {
    this.userPresencePlugin.localUserState?.setName(userIdentity.name);
    this.userPresencePlugin.localUserState?.setColor(userIdentity.color);
  }

  stop() {
    this.docSyncPlugin.stop();
    this.userPresencePlugin.stop();
    this.yDoc?.destroy();
    this.yDoc = null;
    this.yProvider?.disconnect();
    this.yProvider = null;
  }

  flush() {
    this.docSyncPlugin.flush();
  }
}

export const collab = new Collab();
