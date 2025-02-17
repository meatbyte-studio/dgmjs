import React from "react";
import { Doc, Page, Shape } from "@dgmjs/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers } from "./layers";
import { Pages } from "./pages";
import { Empty } from "@/components/common/empty";

export interface ShapeSidebarProps {
  doc: Doc;
  currentPage: Page | null;
  onSelect?: (selection: Shape[]) => void;
  onPageSelect?: (page: Page) => void;
}

export const ShapeSidebar: React.FC<ShapeSidebarProps> = ({
  doc,
  currentPage,
  onSelect,
  onPageSelect,
}) => {
  return (
    <div id="shape-sidebar" className="h-full w-full bg-background p-2">
      <Tabs defaultValue="pages" className="h-full w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
          <TabsTrigger value="libary">Libary</TabsTrigger>
        </TabsList>
        <TabsContent value="pages">
          <Pages
            doc={doc}
            currentPage={currentPage}
            onPageSelect={onPageSelect}
          />
        </TabsContent>
        <TabsContent value="layers">
          <Layers page={currentPage} onSelect={onSelect} />
        </TabsContent>
        <TabsContent value="libary" className="h-full">
          <Empty message="Not Available" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
