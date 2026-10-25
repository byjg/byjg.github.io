import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import Mermaid from '@theme-original/Mermaid';
import styles from './styles.module.css';

const ZOOM_STEP = 1.25;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
// The PNG is drawn at twice the diagram's size, so it stays sharp when zoomed in.
const PNG_SCALE = 2;

// The diagram's own size, from the viewBox Mermaid writes on the <svg>.
function naturalSize(svg) {
  const box = svg.viewBox.baseVal;
  if (box && box.width) {
    return {width: box.width, height: box.height};
  }
  const rect = svg.getBoundingClientRect();
  return {width: rect.width, height: rect.height};
}

function fileName(extension) {
  const slug = document.title.split('|')[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${slug.replace(/^-|-$/g, '') || 'diagram'}.${extension}`;
}

function download(url, name) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
}

// A standalone copy of the diagram: namespaced, and sized from the viewBox instead of the
// page's CSS, so it renders the same in a file or an <img> as on the page.
function serialize(svg) {
  const {width, height} = naturalSize(svg);
  const copy = svg.cloneNode(true);
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('width', width);
  copy.setAttribute('height', height);
  copy.style.maxWidth = 'none';
  copy.style.width = '';
  return new XMLSerializer().serializeToString(copy);
}

export default function MermaidWrapper(props) {
  const viewport = useRef(null);
  const drag = useRef(null);
  const moved = useRef(false);
  // null means "fit the page width", as Docusaurus shows it; a number is the zoom level.
  const [zoom, setZoom] = useState(null);

  const svg = () => viewport.current?.querySelector('svg');

  // The diagram is built once per source text: a zoom change re-renders this wrapper, and
  // re-rendering Mermaid would replace the <svg> and drop the size set on it.
  const diagram = useMemo(() => <Mermaid {...props} />, [props.value]);

  useLayoutEffect(() => {
    const element = svg();
    if (!element) {
      return;
    }
    if (zoom === null) {
      element.style.maxWidth = '';
      element.style.width = '';
      element.style.height = '';
    } else {
      element.style.maxWidth = 'none';
      element.style.width = `${naturalSize(element).width * zoom}px`;
      element.style.height = 'auto';
    }
  }, [zoom]);

  const applyZoom = (next) => setZoom(next);

  const zoomBy = (factor) => {
    const element = svg();
    if (!element) {
      return;
    }
    const current = zoom ?? element.getBoundingClientRect().width / naturalSize(element).width;
    applyZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor)));
  };

  const downloadSvg = () => {
    const element = svg();
    if (!element) {
      return;
    }
    const url = URL.createObjectURL(new Blob([serialize(element)], {type: 'image/svg+xml'}));
    download(url, fileName('svg'));
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const element = svg();
    if (!element) {
      return;
    }
    const {width, height} = naturalSize(element);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * PNG_SCALE;
      canvas.height = height * PNG_SCALE;
      const context = canvas.getContext('2d');
      // The page background, so the light and dark themes both export readable images.
      context.fillStyle = getComputedStyle(document.body).backgroundColor || '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        download(url, fileName('png'));
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialize(element))}`;
  };

  // Drag the zoomed diagram to move around it. Links inside the diagram still work: a
  // press that does not move is a click, and a drag that ends on a link does not open it.
  const onMouseDown = (event) => {
    if (zoom === null || event.button !== 0) {
      return;
    }
    // Otherwise the browser starts its own drag of the label text or link.
    event.preventDefault();
    const element = viewport.current;
    drag.current = {x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop, moved: false};
  };
  const onMouseMove = (event) => {
    if (!drag.current) {
      return;
    }
    const element = viewport.current;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current.moved = drag.current.moved || Math.abs(dx) + Math.abs(dy) > 3;
    element.scrollLeft = drag.current.left - dx;
    element.scrollTop = drag.current.top - dy;
  };
  const stopDrag = () => {
    moved.current = drag.current?.moved ?? false;
    drag.current = null;
  };
  const onClickCapture = (event) => {
    if (moved.current) {
      event.preventDefault();
      event.stopPropagation();
      moved.current = false;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => zoomBy(1 / ZOOM_STEP)} title="Zoom out" aria-label="Zoom out">−</button>
        <button type="button" onClick={() => applyZoom(null)} title="Fit to width" aria-label="Fit to width">
          {zoom === null ? 'Fit' : `${Math.round(zoom * 100)}%`}
        </button>
        <button type="button" onClick={() => zoomBy(ZOOM_STEP)} title="Zoom in" aria-label="Zoom in">+</button>
        <button type="button" onClick={downloadSvg} title="Download as SVG">SVG</button>
        <button type="button" onClick={downloadPng} title="Download as PNG">PNG</button>
      </div>
      <div
        ref={viewport}
        className={zoom === null ? styles.viewport : `${styles.viewport} ${styles.zoomed}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onClickCapture={onClickCapture}>
        {diagram}
      </div>
    </div>
  );
}
