
"use client";

import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
import styles from "./SelectablePublicationPage.module.css";
import "pdfjs-dist/web/pdf_viewer.css";


// Safari: ReadableStream is not async-iterable in older versions, which
// PDF.js relies on in getTextContent().
if (typeof ReadableStream !== "undefined") {
    const streamProto = ReadableStream.prototype as unknown as Record<
        symbol,
        unknown
    >;

    if (!streamProto[Symbol.asyncIterator]) {
        streamProto[Symbol.asyncIterator] = async function* (
            this: ReadableStream
        ) {
            const reader = this.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) return;
                    yield value;
                }
            } finally {
                reader.releaseLock();
            }
        };
    }
}

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type PdfDocument = Awaited<
    ReturnType<typeof pdfjsLib.getDocument>["promise"]
>;

// Reuse each chapter's loaded PDF instead of loading it for every page.
const pdfCache = new Map<string, Promise<PdfDocument>>();

function getPdfDocument(url: string): Promise<PdfDocument> {
    let promise = pdfCache.get(url);

    if (!promise) {
        promise = pdfjsLib.getDocument({ url }).promise;
        pdfCache.set(url, promise);

        promise.catch(() => {
            pdfCache.delete(url);
        });
    }

    return promise;
}

type Props = {
    pdfUrl: string | null;
    pdfPageIndex: number;
    children: ReactNode;
};

export default function SelectablePublicationPage({
    pdfUrl,
    pdfPageIndex,
    children,
}: Props) {
    const frameRef = useRef<HTMLDivElement>(null);
    const layerRef = useRef<HTMLDivElement>(null);
    const [nearViewport, setNearViewport] = useState(false);

    // Begin processing this page when it approaches the viewport.
    useEffect(() => {
        const frame = frameRef.current;

        if (!frame || !pdfUrl) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setNearViewport(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "800px 0px" }
        );

        observer.observe(frame);

        return () => observer.disconnect();
    }, [pdfUrl]);

    useEffect(() => {
        if (!pdfUrl || !nearViewport) return;

        const frame = frameRef.current;
        const layer = layerRef.current;

        if (!frame || !layer) return;

        let cancelled = false;
        let renderVersion = 0;
        let textLayer:
            | InstanceType<typeof pdfjsLib.TextLayer>
            | undefined;

        async function renderTextLayer() {
            const version = ++renderVersion;

            textLayer?.cancel();
            textLayer = undefined;
            layer!.replaceChildren();

            try {
                const pdf = await getPdfDocument(pdfUrl!);

                if (cancelled) return;

                // PDF.js page indexes start at 1; our pageIndex starts at 0.
                const pdfPage = await pdf.getPage(pdfPageIndex + 1);

                if (cancelled) return;

                const baseViewport = pdfPage.getViewport({ scale: 1 });
                const width = frame!.clientWidth;

                if (!width) return;

                const scale = width / baseViewport.width;
                const viewport = pdfPage.getViewport({ scale });

                layer!.style.setProperty("--scale-factor", String(scale));
                layer!.style.setProperty("--user-unit", "1");

                const textContent = await pdfPage.getTextContent();

                if (cancelled || version !== renderVersion) return;

                const pageHeight = baseViewport.height; // PDF units, origin bottom-left

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const items = textContent.items.filter((item: any) => {
                    if (!("str" in item)) return true; // keep structural items

                    const [, b, c, , , y] = item.transform;

                    // 1) rotated text (the sideways running title)
                    const rotated = Math.abs(b) > 0.01 || Math.abs(c) > 0.01;
                    if (rotated) return false;

                    // 2) lone page numbers sitting in the top or bottom margin
                    const isNumberOnly = /^\s*\d{1,3}\s*$/.test(item.str);
                    const inMargin = y < pageHeight * 0.08 || y > pageHeight * 0.92;
                    if (isNumberOnly && inMargin) return false;

                    return true;
                });

                textLayer = new pdfjsLib.TextLayer({
                    textContentSource: { ...textContent, items },
                    container: layer!,
                    viewport,
                });

                await textLayer.render();

            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Unable to create selectable PDF text layer:",
                        error
                    );
                }
            }
        }

        void renderTextLayer();

        const resizeObserver = new ResizeObserver(() => {
            void renderTextLayer();
        });

        resizeObserver.observe(frame);

        return () => {
            cancelled = true;
            renderVersion++;
            resizeObserver.disconnect();
            textLayer?.cancel();
            layer.replaceChildren();
        };
    }, [pdfUrl, pdfPageIndex, nearViewport]);

    return (
        <div className={styles.pageFrame} ref={frameRef}>
            {children}

            {pdfUrl && (
                <div
                    ref={layerRef}
                    className={`${styles.textLayer} textLayer`}
                    aria-label="Selectable publication text"
                />
            )}
        </div>
    );
}
