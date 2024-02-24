/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import * as geometry from "../graphics/geometry";
import { Shape, Box, Line, Diagram } from "../shapes";
import { Controller, Editor, Manipulator } from "../editor";
import { Cursor, MAGNET_THRESHOLD } from "../graphics/const";
import { ccs2lcs, lcs2ccs } from "../graphics/utils";
import * as guide from "../utils/guide";
import { Snap } from "../manipulators/snap";
import type { CanvasPointerEvent } from "../graphics/graphics";

/**
 * BoxMoveAnchorPositionController
 */
export class BoxMoveAnchorPositionController extends Controller {
  /**
   * Snap support for controller
   */
  snap: Snap;

  /**
   * Ghost polygon
   */
  ghost: number[][];

  /**
   * anchor position
   */
  anchorPosition: number;

  /**
   * anchor point
   */
  anchorPoint: number[];

  /**
   * Is the anchor point out of the path
   */
  outOfPath: boolean;

  constructor(manipulator: Manipulator) {
    super(manipulator);
    this.snap = new Snap();
    this.ghost = [];
    this.anchorPosition = 0.5;
    this.anchorPoint = [-1, -1];
    this.outOfPath = false;
  }

  /**
   * Indicates the controller is active or not
   */
  active(editor: Editor, shape: Shape): boolean {
    return (
      editor.selection.size() === 1 &&
      editor.selection.isSelected(shape) &&
      shape instanceof Box &&
      shape.anchored
    );
  }

  /**
   * Returns true if mouse cursor is inside the controller
   */
  mouseIn(editor: Editor, shape: Shape, e: CanvasPointerEvent): boolean {
    if (this.dragging) return true;
    const canvas = editor.canvas;
    const p = [e.x, e.y];
    const anchorPoint = geometry.positionOnPath(
      (shape.parent as Shape).getOutline(),
      (shape as Box).anchorPosition
    );
    const anchorPointCCS = lcs2ccs(canvas, shape.parent as Shape, anchorPoint);
    return guide.inControlPoint(canvas, p, anchorPointCCS);

    // return false;
  }

  /**
   * Returns mouse cursor for the controller
   * @returns cursor [type, angle]
   */
  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: CanvasPointerEvent
  ): [string, number] {
    return [Cursor.POINTER, 0];
  }

  initialize(editor: Editor, shape: Shape): void {
    this.ghost = shape.getEnclosure();
    this.anchorPosition = (shape as Box).anchorPosition;
    this.anchorPoint = geometry.positionOnPath(
      (shape.parent as Shape).getOutline() ?? [],
      (shape as Box).anchorPosition
    );
    this.outOfPath = false;
  }

  /**
   * Update ghost
   */
  update(editor: Editor, shape: Shape) {
    const canvas = editor.canvas;
    let newEnclosure = shape.getEnclosure();
    const dragCCS = lcs2ccs(canvas, shape, this.dragPoint);
    const dragLCS = ccs2lcs(canvas, shape.parent as Shape, dragCCS);
    const outline = (shape.parent as Shape).getOutline();
    const anchorPoint = geometry.findNearestOnPath(
      dragLCS,
      outline,
      MAGNET_THRESHOLD
    );
    if (geometry.distance(anchorPoint, dragLCS) <= MAGNET_THRESHOLD) {
      this.anchorPosition = geometry.getPositionOnPath(outline, anchorPoint);
      this.anchorPoint = anchorPoint;
      this.outOfPath = false;
    } else {
      // set to original position if drag point is too far from the path
      this.anchorPosition = (shape as Box).anchorPosition;
      this.anchorPoint = geometry.positionOnPath(
        outline,
        (shape as Box).anchorPosition
      );
      this.outOfPath = true;
    }
    // update ghost
    this.ghost = newEnclosure.map((p) => [p[0] + this.dx, p[1] + this.dy]);
  }

  /**
   * Finalize shape by ghost
   */
  finalize(editor: Editor, shape: Box) {
    const canvas = editor.canvas;
    // transform shape
    const tr = editor.transform;
    const diagram = editor.diagram as Diagram;
    tr.startTransaction("move-anchor");
    tr.atomicAssign(shape, "anchorPosition", this.anchorPosition);
    tr.resolveAllConstraints(diagram, canvas);
    tr.endTransaction();
  }

  /**
   * Draw controller
   */
  draw(editor: Editor, shape: Box) {
    const canvas = editor.canvas;
    const anchorPoint = geometry.positionOnPath(
      (shape.parent as Shape).getOutline() ?? [],
      shape.anchorPosition
    );
    const anchorPointCCS = lcs2ccs(
      canvas,
      (shape.parent as Shape) ?? shape,
      anchorPoint
    );
    guide.drawControlPoint(canvas, anchorPointCCS, 5);
  }

  /**
   * Draw ghost while dragging
   */
  drawDragging(editor: Editor, shape: Shape, e: CanvasPointerEvent) {
    super.drawDragging(editor, shape, e);
    const canvas = editor.canvas;
    // draw ghost
    guide.drawPolylineInLCS(canvas, shape, this.ghost);
    // drag anchor point
    if (!this.outOfPath) {
      const center = geometry.mid(this.ghost[0], this.ghost[2]);
      const centerCCS = lcs2ccs(canvas, shape, center);
      const anchorPointCCS = lcs2ccs(
        canvas,
        (shape.parent as Shape) ?? shape,
        this.anchorPoint
      );
      guide.drawDottedLine(canvas, centerCCS, anchorPointCCS);
      guide.drawControlPoint(canvas, anchorPointCCS, 5);
    }
    // draw snap
    this.snap.draw(editor, shape, this.ghost);
  }
}
