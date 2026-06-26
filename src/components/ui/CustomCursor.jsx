import React, { useEffect, useRef } from 'react';

/**
 * CustomCursor — a dot + ring cursor that follows mouse.
 * The ring scales up on hoverable elements.
 */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let rafId;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = () => {
      dot.style.left = mx + 'px';
      dot.style.top = my + 'py';
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';

      const ease = 0.12;
      rx += (mx - rx) * ease;
      ry += (my - ry) * ease;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';

      rafId = requestAnimationFrame(loop);
    };

    const onEnterHoverable = () => ring.classList.add('hovering');
    const onLeaveHoverable = () => ring.classList.remove('hovering');

    window.addEventListener('mousemove', onMove);

    const attachHover = () => {
      document.querySelectorAll('a, button, [data-cursor="pointer"]').forEach((el) => {
        el.addEventListener('mouseenter', onEnterHoverable);
        el.addEventListener('mouseleave', onLeaveHoverable);
      });
    };
    attachHover();

    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

    loop();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Only show on desktop
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

export default CustomCursor;
