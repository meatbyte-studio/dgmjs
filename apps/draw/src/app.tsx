import { Editor, Page, Shape, ShapeProps } from "@dgmjs/core";
import {
  YjsDocSyncPlugin,
  YjsUserPresencePlugin,
} from "@dgmjs/dgmjs-plugin-yjs";
import { nanoid } from "nanoid";
import { PaletteToolbar } from "./components/palette-toolbar";
import { useDrawStore } from "./draw-store";
import { Options } from "./components/options";
import { Menus } from "./components/menus";
import { PropertySidebar } from "./components/property-sidebar";
import fontJson from "./fonts.json";
import { Font, fetchFonts, insertFontsToDocument } from "./font-manager";
import { ShapeSidebar } from "./components/shape-sidebar";
import { EditorWrapper } from "./editor";
import { collab, generateUserIdentity } from "./collab";
import { SelectShapeDialog } from "./components/dialogs/select-shape-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./components/ui/context-menu";
import { useEffect, useState } from "react";
import { Share } from "./components/share";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";

declare global {
  interface Window {
    editor: Editor;
  }
}

function App() {
  const drawStore = useDrawStore();
  const [isTextFocused, setIsTextFocused] = useState(false);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const roomId = params.roomId;

  useEffect(() => {
    const focusinHandler = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        setIsTextFocused(true);
      } else {
        setIsTextFocused(false);
      }
    };
    document.addEventListener("focusin", focusinHandler);
    return () => {
      document.removeEventListener("focusin", focusinHandler);
    };
  }, []);

  const handleMount = async (editor: Editor) => {
    window.editor = editor;
    insertFontsToDocument(fontJson as Font[]);
    await fetchFonts(fontJson as Font[]);

    if (roomId) {
      const identity = generateUserIdentity();
      const storedName = localStorage.getItem("share-identity-name");
      const storedColor = localStorage.getItem("share-identity-color");
      if (storedName) {
        identity.name = storedName;
      }
      if (storedColor) {
        identity.color = storedColor;
      }
      collab.start(window.editor, roomId, identity);
      console.log("collab started with roomId", roomId);
      drawStore.setShareRoomId(roomId);
      drawStore.setShareIdentity(identity);
    } else {
      window.editor.newDoc();
    }

    window.editor.transform.onTransaction.addListener(() => {
      // console.log("tx", tx);
    });
    window.editor.transform.onAction.addListener(() => {
      // console.log("action", action);
    });

    // window.editor.factory.onShapeInitialize.addListener((shape: Shape) => {
    //   shape.strokeWidth = 2;
    //   shape.roughness = 1;
    //   shape.fillColor = "$lime9";
    //   shape.fillStyle = FillStyle.HACHURE;
    // });

    // load from local storage
    const localData = localStorage.getItem("local-data");
    if (localData) {
      window.editor.loadFromJSON(JSON.parse(localData));
    }
    drawStore.setDoc(window.editor.getDoc());
    drawStore.setCurrentPage(window.editor.getCurrentPage());
    // window.editor.fitToScreen();

    const isDarkMode = localStorage.getItem("is-dark-mode");
    if (isDarkMode) {
      drawStore.setDarkMode(isDarkMode === "true");
    }
    window.addEventListener("resize", () => {
      window.editor.fit();
    });

    collab.oDocReady.addListener(() => {
      const doc = window.editor.getDoc();
      if (doc) {
        drawStore.setDoc(doc);
        drawStore.setCurrentPage(window.editor.getCurrentPage());
      }
    });

    // forward key event to editor
    // window.addEventListener("keydown", (e) => {
    //   const event = new KeyboardEvent("keydown", { ...e });
    //   editor.canvasElement.dispatchEvent(event);
    // });
  };

  const handleShapeCreate = (shape: Shape) => {
    if (!window.editor.getActiveHandlerLock()) {
      setTimeout(() => {
        window.editor.selection.select([shape]);
        window.editor.repaint();
      }, 0);
    }
  };

  const handleSelectionChange = (selection: Shape[]) => {
    drawStore.setSelection([...selection]);
  };

  const handleActiveHandlerChange = (handlerId: string) => {
    drawStore.setActiveHandler(handlerId);
    window.editor?.selection.deselectAll();
    window.editor?.focus();
  };

  const handleAction = () => {
    const data = window.editor.store.toJSON();
    localStorage.setItem("local-data", JSON.stringify(data));
  };

  const handleSidebarSelect = (selection: Shape[]) => {
    window.editor.selection.select(selection);
  };

  const handleValuesChange = (values: ShapeProps) => {
    const shapes = window.editor.selection.getShapes();
    window.editor.actions.update(values);
    drawStore.setSelection([...shapes]);
  };

  const handlePageChange = (pageProps: Partial<Page>) => {
    const currentPage = window.editor.getCurrentPage();
    window.editor.actions.update(pageProps, [currentPage!]);
    drawStore.setCurrentPage(currentPage);
  };

  const handleCurrentPageChange = (page: Page) => {
    drawStore.setCurrentPage(page);
  };

  const handleShare = () => {
    const roomId = nanoid();
    const identity = generateUserIdentity();
    collab.start(window.editor, roomId!, identity);
    collab.flush();
    window.history.pushState({}, "", `?roomId=${roomId}`);
    drawStore.setShareRoomId(roomId);
    drawStore.setShareIdentity(identity);
  };

  const handleShareStop = () => {
    collab.stop();
    window.history.pushState({}, "", "/");
    drawStore.setShareRoomId(null);
  };

  const handleShareIdentityUpdate = () => {
    const identity = drawStore.shareIdentity;
    if (identity) {
      localStorage.setItem("share-identity-name", identity.name);
      localStorage.setItem("share-identity-color", identity.color);
      collab.updateUserIdentity(identity);
    }
  };
  const defaultOpen =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1] === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar variant="sidebar" side="left">
        <ShapeSidebar
          doc={drawStore.doc!}
          currentPage={drawStore.currentPage}
          onSelect={handleSidebarSelect}
          onPageSelect={(page) => {
            window.editor.setCurrentPage(page);
          }}
        />
      </Sidebar>

      <div className="h-[calc(100dvh)] w-[calc(100vw)]">
        <ContextMenu>
          <ContextMenuTrigger disabled={isTextFocused}>
            <EditorWrapper
              className="h-full w-[calc(100%)]"
              darkMode={drawStore.darkMode}
              options={{
                showDOM: true,
                keymapEventTarget: window,
                imageResize: {
                  quality: 1,
                  maxWidth: 2800,
                  maxHeight: 2800,
                },
              }}
              plugins={[new YjsDocSyncPlugin(), new YjsUserPresencePlugin()]}
              showGrid={drawStore.showGrid}
              onMount={handleMount}
              onShapeCreate={handleShapeCreate}
              onSelectionChange={handleSelectionChange}
              onCurrentPageChange={handleCurrentPageChange}
              onActiveHandlerChange={handleActiveHandlerChange}
              onActiveHandlerLockChange={(lock) =>
                drawStore.setActiveHandlerLock(lock)
              }
              onAction={handleAction}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy (Broken)</ContextMenuItem>
            <ContextMenuItem>Paste (Broken)</ContextMenuItem>
            <ContextMenuItem>Delete (Broken)</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 h-10 w-[800px] border rounded-lg flex items-center justify-between bg-background">
          <Menus />
          <Options />
          <Share
            handleShare={handleShare}
            handleShareStop={handleShareStop}
            handleShareIdentityUpdate={handleShareIdentityUpdate}
          />
        </div>
        <PaletteToolbar />
        <SelectShapeDialog />
        <PropertySidebar
          doc={drawStore.doc!}
          currentPage={drawStore.currentPage!}
          shapes={drawStore.selection}
          onChange={handleValuesChange}
          onPageChange={handlePageChange}
        />
      </div>
    </SidebarProvider>
  );
}

export default App;
