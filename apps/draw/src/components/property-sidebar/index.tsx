import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoxPanel } from "./box-panel";
import { TextPanel } from "./text-panel";
import { ConstraintPanel } from "./constraint-panel";
import { ExtendedPropertyPanel } from "./extended-property-panel";
import { FillPanel } from "./fill-panel";
import { ControlPanel } from "./control-panel";
import { StrokePanel } from "./stroke-panel";
import { TagPanel } from "./tag-panel";
import { Line, Box, Freehand, Doc, Icon, Page, Mirror } from "@dgmjs/core";
import { LinePanel } from "./line-panel";
import { Empty } from "../common/empty";
import { PrototypePanel } from "./prototype-panel";
import { ScriptPanel } from "./script-panel";
import { AlignmentPanel } from "./alignment-panel";
import { CommonPanel } from "./shape-panel";
import { ShapeEditorProps } from "@/types";
import { FreehandPanel } from "./freehand-panel";
import { LinkPanel } from "./link-panel";
import { ReferencePanel } from "./reference-panel";
import { IconPanel } from "./icon-panel";
import { ShadowPanel } from "./shadow-panel";
import { PagePanel } from "./page-panel";
import { MirrorPanel } from "./mirror-panel";

export interface PropertySidebarProps extends ShapeEditorProps {
  doc: Doc;
  currentPage: Page;
  onPageChange: (values: Partial<Page>) => void;
}

export const PropertySidebar: React.FC<PropertySidebarProps> = ({
  doc,
  currentPage,
  shapes,
  onChange,
  onPageChange,
}) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[256px] bg-background border-l p-2">
      <Tabs defaultValue="basic" className="w-full h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="h-full">
          {currentPage && shapes.length === 0 && (
            <div className="absolute w-full pr-5">
              <PagePanel page={currentPage} onPageChange={onPageChange} />
            </div>
          )}
          {shapes.length > 0 ? (
            <ScrollArea className="h-full w-full">
              <FillPanel shapes={shapes} onChange={onChange} />
              <StrokePanel shapes={shapes} onChange={onChange} />
              <CommonPanel shapes={shapes} onChange={onChange} />
              {shapes.some((s) => s instanceof Mirror) && (
                <MirrorPanel doc={doc} shapes={shapes} onChange={onChange} />
              )}
              {shapes.some((s) => s instanceof Box) && (
                <>
                  <BoxPanel shapes={shapes} onChange={onChange} />
                  <TextPanel shapes={shapes} onChange={onChange} />
                </>
              )}
              {shapes.some((s) => s instanceof Freehand) && (
                <FreehandPanel shapes={shapes} onChange={onChange} />
              )}
              {shapes.some((s) => s instanceof Line) && (
                <LinePanel shapes={shapes} onChange={onChange} />
              )}
              {shapes.some((s) => s instanceof Icon) && (
                <IconPanel shapes={shapes} onChange={onChange} />
              )}
              <ShadowPanel shapes={shapes} onChange={onChange} />
              <AlignmentPanel shapes={shapes} onChange={onChange} />
            </ScrollArea>
          ) : (
            <Empty message="No shapes selected" />
          )}
        </TabsContent>
        <TabsContent value="advanced" className="h-full">
          {shapes.length > 0 ? (
            <ScrollArea className="h-full w-full">
              {shapes.length === 1 && (
                <>
                  <PrototypePanel shapes={shapes} onChange={onChange} />
                  <ExtendedPropertyPanel shapes={shapes} onChange={onChange} />
                  <ConstraintPanel shapes={shapes} onChange={onChange} />
                  <ScriptPanel shapes={shapes} onChange={onChange} />
                  <TagPanel shapes={shapes} onChange={onChange} />
                  <LinkPanel doc={doc} shapes={shapes} onChange={onChange} />
                  <ReferencePanel
                    doc={doc}
                    shapes={shapes}
                    onChange={onChange}
                  />
                </>
              )}
              <ControlPanel shapes={shapes} onChange={onChange} />
            </ScrollArea>
          ) : (
            <Empty message="No shapes selected" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
