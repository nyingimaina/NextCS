import { ReactElement, cloneElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type PortifyProps = {
  portal?: Element;
  children: ReactElement<{ className: string }>;
  className?: string;
  zIndexOffset?: number;
};

const Portify = ({
  portal,
  children,
  className,
  zIndexOffset,
}: PortifyProps) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<Element | null>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    setTarget(portal || document.body);
  }, [portal]);

  // First pass: measure child in normal DOM flow
  useEffect(() => {
    if (measureRef.current && !measured) {
      const rect = measureRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      setMeasured(true);
    }
  }, [measured]);

  // Continuous tracking after portaling
  useEffect(() => {
    if (!measured) return;
    let frameId: number;
    const measure = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        const newPosition = {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        };
        setPosition((prev) =>
          prev.top !== newPosition.top ||
          prev.left !== newPosition.left ||
          prev.width !== newPosition.width ||
          prev.height !== newPosition.height
            ? newPosition
            : prev
        );
      }
      frameId = requestAnimationFrame(measure);
    };
    frameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frameId);
  }, [measured]);

  if (!measured) {
    // Temporarily render child inline to measure
    return <div ref={measureRef}>{cloneElement(children, { className })}</div>;
  }

  if (!target) {
    // Render placeholder until target is ready
    return <div ref={placeholderRef} />;
  }

  return (
    <>
      {/* Placeholder with measured size to preserve layout */}
      <div
        ref={placeholderRef}
        style={{
          width: `${position.width}px`,
          height: `${position.height}px`,
          visibility: "hidden",
        }}
      />

      {/* Portaled child */}
      {createPortal(
        <div
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
            zIndex: 9999 + (zIndexOffset || 0),
          }}
        >
          {cloneElement(children, { className })}
        </div>,
        target
      )}
    </>
  );
};

export default Portify;
