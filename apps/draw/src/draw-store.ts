import { Doc, Page, Shape } from "@dgmjs/core";
import { UserIdentity } from "@dgmjs/dgmjs-plugin-yjs";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface DrawState {
  scale: number;
  origin: number[];
  darkMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  activeHandler: string | null;
  activeHandlerLock: boolean;
  doc: Doc | null;
  currentPage: Page | null;
  selection: Shape[];
  libraries: Doc[];
  hasCollab: boolean | null;
  shareRoomId: string | null;
  shareIdentity: UserIdentity | null;
  setScale: (scale: number) => void;
  setOrigin: (origin: [number, number]) => void;
  setDarkMode: (darkMode: boolean) => void;
  setShowGrid: (showGrid: boolean) => void;
  setSnapToGrid: (snapToGrid: boolean) => void;
  setSnapToObjects: (snapToObjects: boolean) => void;
  setActiveHandler: (handlerId: string | null) => void;
  setActiveHandlerLock: (lock: boolean) => void;
  setDoc: (doc: Doc | null) => void;
  setCurrentPage: (page: Page | null) => void;
  setSelection: (selections: Shape[]) => void;
  setLibraries: (libraries: Doc[]) => void;
  setHasCollab: (hasCollab: boolean) => void;
  setShareRoomId: (roomId: string | null) => void;
  setShareIdentity: (identity: UserIdentity | null) => void;
}

export const useDrawStore = create<DrawState>()(
  devtools(
    (set) => ({
      scale: 1,
      origin: [0, 0],
      darkMode: true,
      showGrid: false,
      snapToGrid: false,
      snapToObjects: false,
      activeHandler: "Select",
      activeHandlerLock: false,
      doc: null,
      currentPage: null,
      selection: [],
      libraries: [],
      hasCollab: null,
      shareRoomId: null,
      shareIdentity: null,
      setScale: (scale) => set((state) => ({ scale })),
      setOrigin: (origin) => set((state) => ({ origin })),
      setDarkMode: (darkMode) => {
        const root = window.document.documentElement;
        root.classList.remove("dark");
        if (darkMode) root.classList.add("dark");
        if (darkMode) localStorage.setItem("is-dark-mode", "true");
        else localStorage.removeItem("is-dark-mode");
        window.editor.setDarkMode(darkMode);
        set((state) => ({ darkMode }));
      },
      setShowGrid: (showGrid) => set((state) => ({ showGrid })),
      setSnapToGrid: (snapToGrid) => set((state) => ({ snapToGrid })),
      setSnapToObjects: (snapToObjects) =>
        set((state) => ({ snapToObjects: snapToObjects })),
      setActiveHandler: (handlerId) =>
        set((state) => ({ activeHandler: handlerId })),
      setActiveHandlerLock: (lock) =>
        set((state) => ({ activeHandlerLock: lock })),
      setDoc: (doc) => set((state) => ({ doc: doc })),
      setCurrentPage: (page) => set((state) => ({ currentPage: page })),
      setSelection: (selections) => set((state) => ({ selection: selections })),
      setLibraries: (libraries) => set((state) => ({ libraries })),
      setHasCollab: (hasCollab) => set((state) => ({ hasCollab })),
      setShareRoomId: (roomId) => set((state) => ({ shareRoomId: roomId })),
      setShareIdentity: (identity) =>
        set((state) => ({ shareIdentity: identity })),
    }),
    { name: "DrawStore" }
  )
);
