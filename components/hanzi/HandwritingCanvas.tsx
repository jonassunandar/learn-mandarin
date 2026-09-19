"use client";
import {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Undo2, Eraser } from "lucide-react";
import { HanziGlyph } from "./HanziGlyph";
type Point = { x: number; y: number; p: number };
export type CanvasHandle = { clear: () => void; hasInk: () => boolean };
export const HandwritingCanvas = forwardRef<
  CanvasHandle,
  {
    onInkChange?: (hasInk: boolean) => void;
    label?: string;
    guide?: { character: string; opacity: number };
    readOnly?: boolean;
  }
>(function HandwritingCanvas(
  { onInkChange, label = "Handwriting practice area", guide, readOnly = false },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const pointer = useRef<number | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const redraw = useCallback(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const rect = el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (
      el.width !== Math.round(rect.width * dpr) ||
      el.height !== Math.round(rect.height * dpr)
    ) {
      el.width = Math.round(rect.width * dpr);
      el.height = Math.round(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = getComputedStyle(el).color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes.current) {
      if (!stroke.length) continue;
      if (stroke.length === 1) {
        const p = stroke[0];
        ctx.beginPath();
        ctx.arc(
          p.x * rect.width,
          p.y * rect.height,
          1.2 + p.p * 1.7,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        continue;
      }
      for (let i = 1; i < stroke.length; i++) {
        const a = stroke[i - 1],
          b = stroke[i];
        ctx.lineWidth = 2 + ((a.p + b.p) / 2) * 4;
        ctx.beginPath();
        const prev = stroke[Math.max(0, i - 2)];
        ctx.moveTo(
          ((prev.x + a.x) / 2) * rect.width,
          ((prev.y + a.y) / 2) * rect.height,
        );
        ctx.quadraticCurveTo(
          a.x * rect.width,
          a.y * rect.height,
          ((a.x + b.x) / 2) * rect.width,
          ((a.y + b.y) / 2) * rect.height,
        );
        ctx.stroke();
      }
      const a = stroke[stroke.length - 2],
        b = stroke[stroke.length - 1];
      ctx.beginPath();
      ctx.moveTo(
        ((a.x + b.x) / 2) * rect.width,
        ((a.y + b.y) / 2) * rect.height,
      );
      ctx.lineTo(b.x * rect.width, b.y * rect.height);
      ctx.stroke();
    }
  }, []);
  const notify = useCallback(() => {
    const ink = strokes.current.length > 0;
    setHasInk(ink);
    onInkChange?.(ink);
  }, [onInkChange]);
  const clear = useCallback(() => {
    strokes.current = [];
    pointer.current = null;
    redraw();
    notify();
  }, [redraw, notify]);
  useImperativeHandle(
    ref,
    () => ({ clear, hasInk: () => strokes.current.length > 0 }),
    [clear],
  );
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const observer = new ResizeObserver(redraw);
    observer.observe(el);
    const theme = new MutationObserver(redraw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    redraw();
    return () => {
      observer.disconnect();
      theme.disconnect();
    };
  }, [redraw]);
  function point(e: {
    clientX: number;
    clientY: number;
    pressure: number;
    pointerType: string;
  }): Point {
    const r = canvas.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
      p: e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5,
    };
  }
  return (
    <div className={`writing-block${readOnly ? " is-readonly" : ""}`}>
      <div className="writing-paper">
        <span className="grid-diagonal one" />
        <span className="grid-diagonal two" />
        {guide && (
          <div
            className="tracing-guide"
            style={{ opacity: guide.opacity }}
            aria-hidden="true"
          >
            <HanziGlyph character={guide.character} />
          </div>
        )}
        <canvas
          ref={canvas}
          aria-label={label}
          role="img"
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            if (readOnly || pointer.current !== null || e.button > 0) return;
            e.preventDefault();
            pointer.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            strokes.current.push([point(e)]);
            redraw();
            notify();
          }}
          onPointerMove={(e) => {
            if (readOnly || pointer.current !== e.pointerId) return;
            e.preventDefault();
            const events = e.nativeEvent.getCoalescedEvents?.() ?? [
              e.nativeEvent,
            ];
            for (const p of events.length ? events : [e.nativeEvent])
              strokes.current[strokes.current.length - 1]?.push(point(p));
            redraw();
          }}
          onPointerUp={(e) => {
            if (pointer.current === e.pointerId) {
              pointer.current = null;
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={(e) => {
            if (pointer.current === e.pointerId) pointer.current = null;
          }}
          onLostPointerCapture={() => {
            pointer.current = null;
          }}
        />
        {!readOnly && <span className="paper-caption">WRITE HERE</span>}
      </div>
      {!readOnly && (
        <div className="canvas-tools">
          <button className="text-button" disabled={!hasInk} onClick={clear}>
            <Eraser size={17} /> Clear
          </button>
          <span>Pen or finger</span>
          <button
            className="text-button"
            disabled={!hasInk}
            onClick={() => {
              strokes.current.pop();
              pointer.current = null;
              redraw();
              notify();
            }}
          >
            <Undo2 size={17} /> Undo
          </button>
        </div>
      )}
    </div>
  );
});
