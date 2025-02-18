import React, { useRef } from "react";
import { Doc, Page } from "@dgmjs/core";
import { DGMPageView, DGMShapeViewHandle } from "@dgmjs/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  RefreshCcwIcon,
  XIcon,
} from "lucide-react";
import { useDrawStore } from "@/draw-store";
import { useState } from "react";

interface PageViewProps extends React.HTMLAttributes<HTMLDivElement> {
  doc: Doc;
  page: Page;
  idx: number;
  pagesCount: number;
  onPageSelect: (page: Page) => void;
  onRefresh: () => void;
}

const PageView: React.FC<PageViewProps> = ({
  doc,
  page,
  idx,
  pagesCount,
  onPageSelect,
  className,
  onRefresh,
  ...others
}) => {
  const { darkMode, setDoc } = useDrawStore();
  const shapeViewRef = useRef<DGMShapeViewHandle>(null);

  return (
    <div
      key={page.id}
      className={cn(
        "text-sm px-4 py-2 cursor-pointer hover:bg-muted transition-colors",
        className
      )}
      {...others}
    >
      <div>
        <DGMPageView
          ref={shapeViewRef}
          className="w-full border rounded"
          page={page}
          maxScale={1}
          scaleAdjust={page.size ? 1 : 0.8}
          darkMode={darkMode}
        />
      </div>
      <div className="flex flex-col items-center">
        <div>{(page as Page).name || "(Untitled)"}</div>
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => {
              window.editor.actions.duplicatePage(
                page as Page,
                idx + 1,
                (page: Page) => {
                  page.name = `Copy of ${page.name}`;
                }
              );
              onRefresh();
            }}
          >
            <CopyIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => {
              if (idx > 0) {
                window.editor.actions.reorderPage(page as Page, idx - 1);
                onRefresh();
              }
            }}
          >
            <ArrowUpIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => {
              window.editor.actions.reorderPage(page as Page, idx + 1);
              onRefresh();
            }}
          >
            <ArrowDownIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => {
              window.editor.actions.removePage(page as Page);
              onRefresh();
              if (pagesCount <= 1) {
                window.editor.newDoc();
                setDoc(window.editor.getDoc());
                onPageSelect(window.editor.getCurrentPage() as Page);
                const data = window.editor.store.toJSON();
                localStorage.setItem("local-data", JSON.stringify(data));
              }
            }}
          >
            <XIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => {
              shapeViewRef.current?.repaint();
            }}
          >
            <RefreshCcwIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface PagesProps {
  doc: Doc;
  currentPage: Page | null;
  onPageSelect: (page: Page | null) => void;
}

export const Pages: React.FC<PagesProps> = ({
  doc,
  currentPage,
  onPageSelect,
}) => {
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());

  const handleRefresh = () => {
    setRefreshKey(Date.now());
  };

  return (
    <ScrollArea className="h-full w-full" key={refreshKey}>
      {doc?.children.map((page, idx) => (
        <PageView
          doc={doc}
          key={page.id}
          page={page as Page}
          idx={idx}
          pagesCount={doc.children.length}
          className={cn(page.id === currentPage?.id && "bg-muted")}
          onPageSelect={onPageSelect}
          onClick={() => {
            if (onPageSelect) onPageSelect(page as Page);
          }}
          onRefresh={handleRefresh}
        />
      ))}
    </ScrollArea>
  );
};
