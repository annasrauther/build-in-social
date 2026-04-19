/**
 * Minimal type stubs for @dnd-kit packages.
 * These are placeholders until `pnpm install` is run after adding @dnd-kit
 * to package.json. Once installed, the real package types take precedence.
 */

declare module "@dnd-kit/core" {
  import type { ReactNode, CSSProperties, MutableRefObject } from "react";

  export interface DragStartEvent {
    active: { id: string | number; data: { current: Record<string, unknown> } };
  }

  export interface DragOverEvent {
    active: { id: string | number };
    over: { id: string | number } | null;
  }

  export interface DragEndEvent {
    active: { id: string | number };
    over: { id: string | number } | null;
    delta: { x: number; y: number };
  }

  export interface Transform {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  }

  export interface UseDroppableArguments {
    id: string | number;
    disabled?: boolean;
    data?: Record<string, unknown>;
  }

  export interface UseDroppableReturn {
    isOver: boolean;
    setNodeRef: (element: HTMLElement | null) => void;
    rect: MutableRefObject<DOMRectReadOnly | null>;
    active: { id: string | number } | null;
    over: { id: string | number } | null;
  }

  export interface UseDraggableArguments {
    id: string | number;
    disabled?: boolean;
    data?: Record<string, unknown>;
    attributes?: {
      role?: string;
      tabIndex?: number;
      "aria-label"?: string;
      "aria-describedby"?: string;
      "aria-roledescription"?: string;
    };
  }

  export interface UseDraggableReturn {
    attributes: {
      role: string;
      tabIndex: number;
      "aria-label"?: string;
      "aria-describedby": string;
      "aria-roledescription": string;
      "aria-disabled": boolean;
      "aria-pressed": boolean | undefined;
    };
    isDragging: boolean;
    listeners: Record<string, (...args: unknown[]) => void> | undefined;
    node: MutableRefObject<HTMLElement | null>;
    over: { id: string | number } | null;
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    setNodeRef: (element: HTMLElement | null) => void;
    transform: { x: number; y: number } | null;
  }

  export interface DndContextProps {
    children?: ReactNode;
    onDragStart?: (event: DragStartEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    onDragCancel?: () => void;
    collisionDetection?: CollisionDetection;
    sensors?: SensorDescriptor<SensorOptions>[];
    modifiers?: Modifier[];
  }

  export interface DragOverlayProps {
    children?: ReactNode;
    dropAnimation?: DropAnimation | null;
    style?: CSSProperties;
    className?: string;
    zIndex?: number;
    transition?: string;
    wrapperElement?: string;
    adjustScale?: boolean;
    modifiers?: Modifier[];
  }

  export type CollisionDetection = (args: {
    active: { id: string | number };
    collisionRect: DOMRect;
    droppableRects: Map<string | number, DOMRect>;
    droppableContainers: Array<{ id: string | number }>;
    pointerCoordinates: { x: number; y: number } | null;
  }) => Array<{ id: string | number; data?: { value: number } }>;

  export interface DropAnimation {
    duration: number;
    easing: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type SensorDescriptor<T> = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type SensorOptions = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Modifier = any;

  export function DndContext(props: DndContextProps): JSX.Element;
  export function DragOverlay(props: DragOverlayProps): JSX.Element;
  export function useDroppable(args: UseDroppableArguments): UseDroppableReturn;
  export function useDraggable(args: UseDraggableArguments): UseDraggableReturn;
  export const closestCenter: CollisionDetection;
  export const closestCorners: CollisionDetection;
  export const rectIntersection: CollisionDetection;
  export const pointerWithin: CollisionDetection;
}

declare module "@dnd-kit/sortable" {
  import type { ReactNode } from "react";
  import type { Transform } from "@dnd-kit/core";

  export interface SortableContextProps {
    children?: ReactNode;
    items: Array<string | number | { id: string | number }>;
    strategy?: SortingStrategy;
    id?: string;
    disabled?: boolean;
  }

  export type SortingStrategy = (args: {
    rects: DOMRect[];
    activeNodeRect: DOMRect | null;
    activeIndex: number;
    overIndex: number;
    index: number;
  }) => Transform | null;

  export interface UseSortableArguments {
    id: string | number;
    disabled?: boolean;
    data?: Record<string, unknown>;
  }

  export function SortableContext(props: SortableContextProps): JSX.Element;
  export function useSortable(args: UseSortableArguments): {
    attributes: Record<string, unknown>;
    listeners: Record<string, (...args: unknown[]) => void> | undefined;
    setNodeRef: (element: HTMLElement | null) => void;
    transform: Transform | null;
    transition: string | undefined;
    isDragging: boolean;
    over: { id: string | number } | null;
    active: { id: string | number } | null;
    index: number;
    isSorting: boolean;
    overIndex: number;
    items: Array<string | number>;
    newIndex: number;
  };
  export const verticalListSortingStrategy: SortingStrategy;
  export const horizontalListSortingStrategy: SortingStrategy;
  export const rectSortingStrategy: SortingStrategy;
  export const rectSwappingStrategy: SortingStrategy;
  export function arrayMove<T>(array: T[], from: number, to: number): T[];
}

declare module "@dnd-kit/utilities" {
  import type { Transform } from "@dnd-kit/core";
  export interface CSS {
    Transform: {
      toString(transform: Transform | null): string | undefined;
    };
    Transition: {
      toString(transition: { property: string; duration: number; easing: string } | null): string | undefined;
    };
  }
  export const CSS: CSS;
}
