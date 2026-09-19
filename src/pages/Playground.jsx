import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import JSZip from "jszip";
import {
    FiCheck,
    FiChevronDown,
    FiClock,
    FiDownload,
    FiFilePlus,
    FiLayers,
    FiPlay,
    FiRefreshCw,
    FiSliders,
    FiTrash2,
    FiType,
    FiUploadCloud,
    FiX,
    FiZap,
} from "react-icons/fi";

// Change these paths if your project structure is different.
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DEFAULT_SETTINGS = {
    showBackground: true,
    backgroundColor: "#FFFFFF",
    backgroundRadius: 14,

    textColor: "#111111",
    textSize: 64,
    fontWeight: 700,
    fontFamily: "Arial",

    lineSpacing: 10,
    letterSpacing: 0,

    showStroke: false,
    strokeColor: "#FFFFFF",
    strokeWidth: 3,

    entryMode: "seconds",
    entryValue: 0,

    exitMode: "seconds",
    exitValue: 0,

    entryAnimation: "fade",
    exitAnimation: "fade",
    transitionDuration: 0.35,
};

const ANIMATIONS = [
    { value: "none", label: "None" },
    { value: "fade", label: "Fade" },
    { value: "slide-up", label: "Slide Up" },
    { value: "slide-down", label: "Slide Down" },
    { value: "slide-left", label: "Slide Left" },
    { value: "slide-right", label: "Slide Right" },
    { value: "pop", label: "Pop" },
];

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
    )}`;
}

function sanitizeFileName(name) {
    return name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function getVideoCaptureStream(video) {
    if (typeof video.captureStream === "function") {
        return video.captureStream();
    }

    if (typeof video.mozCaptureStream === "function") {
        return video.mozCaptureStream();
    }

    return null;
}

function getSupportedMimeType() {
    const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
    ];

    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - r,
        y + height
    );
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function measureTrackedText(ctx, text, letterSpacing) {
    if (!text) return 0;

    let width = 0;

    for (const char of text) {
        width += ctx.measureText(char).width + letterSpacing;
    }

    return Math.max(0, width - letterSpacing);
}

function breakLongWord(ctx, word, maxWidth, letterSpacing) {
    const pieces = [];
    let current = "";

    for (const char of word) {
        const test = current + char;

        if (
            current &&
            measureTrackedText(ctx, test, letterSpacing) > maxWidth
        ) {
            pieces.push(current);
            current = char;
        } else {
            current = test;
        }
    }

    if (current) pieces.push(current);

    return pieces;
}

function wrapText(ctx, text, maxWidth, letterSpacing) {
    const words = text.trim().split(/\s+/);
    const lines = [];
    let current = "";

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;

        if (
            measureTrackedText(ctx, test, letterSpacing) <= maxWidth
        ) {
            current = test;
            continue;
        }

        if (current) {
            lines.push(current);
            current = "";
        }

        if (
            measureTrackedText(ctx, word, letterSpacing) <= maxWidth
        ) {
            current = word;
        } else {
            const pieces = breakLongWord(
                ctx,
                word,
                maxWidth,
                letterSpacing
            );

            lines.push(...pieces.slice(0, -1));
            current = pieces[pieces.length - 1] || "";
        }
    }

    if (current) lines.push(current);

    return lines.length ? lines : [""];
}

function drawTrackedText(
    ctx,
    text,
    x,
    y,
    letterSpacing,
    mode = "fill"
) {
    const characters = [...text];

    let totalWidth = measureTrackedText(
        ctx,
        text,
        letterSpacing
    );

    let cursor = x - totalWidth / 2;

    for (const char of characters) {
        const charWidth = ctx.measureText(char).width;

        if (mode === "stroke") {
            ctx.strokeText(char, cursor + charWidth / 2, y);
        } else {
            ctx.fillText(char, cursor + charWidth / 2, y);
        }

        cursor += charWidth + letterSpacing;
    }
}

// FIX: previously this only ever received `entryAnimation` for BOTH the
// entry and exit phases, so whatever the user picked for "Exit transition"
// was silently ignored. Now entry and exit animations are tracked
// independently, and each contributes its own opacity/translate/scale.
function getAnimationState(
    entryAnimation,
    exitAnimation,
    entryProgress,
    exitProgress,
    transitionSize
) {
    let opacity = 1;
    let translateX = 0;
    let translateY = 0;
    let scale = 1;

    if (entryAnimation === "fade") {
        opacity *= entryProgress;
    }

    if (entryAnimation === "slide-up") {
        translateY += (1 - entryProgress) * transitionSize;
    }

    if (entryAnimation === "slide-down") {
        translateY -= (1 - entryProgress) * transitionSize;
    }

    if (entryAnimation === "slide-left") {
        translateX += (1 - entryProgress) * transitionSize;
    }

    if (entryAnimation === "slide-right") {
        translateX -= (1 - entryProgress) * transitionSize;
    }

    if (entryAnimation === "pop") {
        scale *= 0.85 + entryProgress * 0.15;
    }

    if (exitProgress > 0) {
        if (exitAnimation === "fade") {
            opacity *= 1 - exitProgress;
        }

        if (exitAnimation === "slide-up") {
            translateY -= exitProgress * transitionSize;
        }

        if (exitAnimation === "slide-down") {
            translateY += exitProgress * transitionSize;
        }

        if (exitAnimation === "slide-left") {
            translateX -= exitProgress * transitionSize;
        }

        if (exitAnimation === "slide-right") {
            translateX += exitProgress * transitionSize;
        }

        if (exitAnimation === "pop") {
            scale *= 1 - exitProgress * 0.15;
        }
    }

    return {
        opacity,
        translateX,
        translateY,
        scale,
    };
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-black" : "bg-black/15"
                }`}
            aria-pressed={checked}
        >
            <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"
                    }`}
            />
        </button>
    );
}

function NumberControl({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    suffix = "",
}) {
    return (
        <div>
            {label && (
                <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-black/75">
                        {label}
                    </label>

                    <div className="flex items-center rounded-lg border border-black/10 bg-white">
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) =>
                                onChange(
                                    clamp(
                                        Number(e.target.value) || 0,
                                        min,
                                        max
                                    )
                                )
                            }
                            className="w-16 bg-transparent px-2 py-1 text-right text-xs font-semibold outline-none"
                        />

                        {suffix && (
                            <span className="pr-2 text-xs text-black/40">
                                {suffix}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {!label && (
                <div className="mb-2 flex justify-end">
                    <div className="flex items-center rounded-lg border border-black/10 bg-white">
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) =>
                                onChange(
                                    clamp(
                                        Number(e.target.value) || 0,
                                        min,
                                        max
                                    )
                                )
                            }
                            className="w-16 bg-transparent px-2 py-1 text-right text-xs font-semibold outline-none"
                        />

                        {suffix && (
                            <span className="pr-2 text-xs text-black/40">
                                {suffix}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-black"
            />
        </div>
    );
}

function ColorControl({
    label,
    value,
    onChange,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-black/75">
                {label}
            </label>

            <div className="flex gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-11 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium uppercase outline-none focus:border-black"
                />
            </div>
        </div>
    );
}

function SelectControl({
    label,
    value,
    onChange,
    options,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-black/75">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-black"
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40" />
            </div>
        </div>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="mb-5 flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/10 text-black">
                <Icon size={17} />
            </div>

            <div>
                <h3 className="font-bold text-black">
                    {title}
                </h3>

                {description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-black/45">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

// FIX: this used to receive `previewRef` as a *callback function* passed
// down from the grandparent (Playground -> ClipEditor -> here) and then
// tried to read `previewRef.current` on it. Functions don't have a
// `.current` property, so every drag attempt threw immediately and the
// drag never actually moved anything. This component now owns its own
// ref for measuring the drop zone, which also fixes the caption chip
// being un-draggable whenever it happened to be "outside its visible
// window" (it's now always draggable so you can position it regardless
// of where the playhead currently is).
function PositionOverlay({
    clip,
    settings,
    currentTime,
    duration,
    onPositionChange,
}) {
    const overlayRef = useRef(null);
    const draggingRef = useRef(false);

    const captionVisible = useMemo(() => {
        if (!clip?.text?.trim()) return false;

        // FIX: duration is 0 for a brief moment before video metadata
        // loads. With duration = 0, start/end both resolved to 0, which
        // made `currentTime (0) >= start (0) && currentTime (0) <= end (0)`
        // true — so the caption briefly rendered at full strength before
        // snapping to its correct (dimmed/hidden) state once real timing
        // kicked in. Treat "no duration yet" as "not visible".
        if (!duration) return false;

        let start = 0;
        let end = duration;

        if (settings.entryMode === "seconds") {
            start = clamp(settings.entryValue, 0, duration);
        } else {
            start = (duration * clamp(settings.entryValue, 0, 100)) / 100;
        }

        if (settings.exitMode === "seconds") {
            end = duration - clamp(settings.exitValue, 0, duration);
        } else {
            end = duration * (1 - clamp(settings.exitValue, 0, 100) / 100);
        }

        start = clamp(start, 0, duration);
        end = clamp(end, 0, duration);

        return currentTime >= start && currentTime <= end;
    }, [
        clip?.text,
        currentTime,
        duration,
        settings.entryMode,
        settings.entryValue,
        settings.exitMode,
        settings.exitValue,
    ]);

    if (!clip?.text?.trim()) return null;

    return (
        <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
        >
            <div
                className="group absolute cursor-move touch-none select-none"
                style={{
                    left: `${clip.position.x}%`,
                    top: `${clip.position.y}%`,
                    transform: "translate(-50%, -50%)",
                    opacity: captionVisible ? 1 : 0.4,
                    pointerEvents: "auto",
                }}
                onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture?.(
                        event.pointerId
                    );

                    draggingRef.current = true;

                    const move = (moveEvent) => {
                        if (!draggingRef.current || !overlayRef.current) {
                            return;
                        }

                        const rect =
                            overlayRef.current.getBoundingClientRect();

                        const x =
                            ((moveEvent.clientX - rect.left) /
                                rect.width) *
                            100;

                        const y =
                            ((moveEvent.clientY - rect.top) /
                                rect.height) *
                            100;

                        onPositionChange(
                            clamp(x, 2, 98),
                            clamp(y, 2, 98)
                        );
                    };

                    const up = () => {
                        draggingRef.current = false;
                        window.removeEventListener(
                            "pointermove",
                            move
                        );
                        window.removeEventListener(
                            "pointerup",
                            up
                        );
                    };

                    window.addEventListener(
                        "pointermove",
                        move
                    );
                    window.addEventListener("pointerup", up);
                }}
            >
                <div
                    className="whitespace-nowrap rounded-xl px-4 py-2 text-center shadow-lg ring-2 ring-transparent transition group-hover:ring-black/20"
                    style={{
                        backgroundColor: settings.showBackground
                            ? settings.backgroundColor
                            : "transparent",

                        borderRadius: `${settings.backgroundRadius}px`,

                        color: settings.textColor,

                        fontSize: `${Math.max(
                            10,
                            settings.textSize * 0.55
                        )}px`,

                        fontWeight: settings.fontWeight,

                        fontFamily: settings.fontFamily,

                        letterSpacing: `${settings.letterSpacing}px`,

                        WebkitTextStroke: settings.showStroke
                            ? `${Math.max(
                                0.5,
                                settings.strokeWidth * 0.5
                            )}px ${settings.strokeColor}`
                            : "0px transparent",
                    }}
                >
                    {clip.text}
                </div>

                <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Drag to position
                </div>

                {!captionVisible && (
                    <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        Hidden at this time — showing position preview
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Playground() {
    const fileInputRef = useRef(null);

    const processedUrlsRef = useRef(new Set());

    const [clips, setClips] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const [settings, setSettings] =
        useState(DEFAULT_SETTINGS);

    const [isDraggingFiles, setIsDraggingFiles] =
        useState(false);

    const [isProcessing, setIsProcessing] =
        useState(false);

    const [progress, setProgress] = useState({
        completed: 0,
        total: 0,
    });

    const [notice, setNotice] = useState("");

    const selectedClip =
        clips.find((clip) => clip.id === selectedId) ||
        clips[0] ||
        null;

    const processedClips = clips.filter(
        (clip) => clip.processedUrl
    );

    const invalidateProcessed = useCallback(() => {
        processedUrlsRef.current.forEach((url) => {
            URL.revokeObjectURL(url);
        });

        processedUrlsRef.current.clear();

        setClips((previous) =>
            previous.map((clip) => ({
                ...clip,
                processedUrl: null,
                processedBlob: null,
                status: "idle",
                error: null,
            }))
        );
    }, []);

    const updateSetting = useCallback(
        (key, value) => {
            setSettings((previous) => ({
                ...previous,
                [key]: value,
            }));

            invalidateProcessed();
        },
        [invalidateProcessed]
    );

    const addFiles = useCallback(
        (fileList) => {
            const files = Array.from(fileList).filter((file) =>
                file.type.startsWith("video/")
            );

            if (!files.length) {
                setNotice("Please select video files.");
                return;
            }

            const newClips = files.map((file) => ({
                id: makeId(),
                file,
                url: URL.createObjectURL(file),
                name: file.name,
                text: "",
                position: {
                    x: 50,
                    y: 75,
                },
                duration: 0,
                processedUrl: null,
                processedBlob: null,
                status: "idle",
                error: null,
            }));

            setClips((previous) => [
                ...previous,
                ...newClips,
            ]);

            setSelectedId((current) =>
                current || newClips[0]?.id || null
            );

            setNotice("");
        },
        []
    );

    const removeClip = useCallback(
        (id) => {
            setClips((previous) => {
                const clip = previous.find(
                    (item) => item.id === id
                );

                if (clip?.url) {
                    URL.revokeObjectURL(clip.url);
                }

                if (clip?.processedUrl) {
                    URL.revokeObjectURL(clip.processedUrl);
                    processedUrlsRef.current.delete(
                        clip.processedUrl
                    );
                }

                const remaining = previous.filter(
                    (item) => item.id !== id
                );

                if (selectedId === id) {
                    setSelectedId(
                        remaining[0]?.id || null
                    );
                }

                return remaining;
            });
        },
        [selectedId]
    );

    const clearAll = useCallback(() => {
        clips.forEach((clip) => {
            if (clip.url) URL.revokeObjectURL(clip.url);

            if (clip.processedUrl) {
                URL.revokeObjectURL(clip.processedUrl);
            }
        });

        processedUrlsRef.current.clear();

        setClips([]);
        setSelectedId(null);
        setNotice("");
        setProgress({
            completed: 0,
            total: 0,
        });
    }, [clips]);

    const updateClipText = useCallback(
        (id, text) => {
            setClips((previous) =>
                previous.map((clip) =>
                    clip.id === id
                        ? {
                            ...clip,
                            text,
                            processedUrl: null,
                            processedBlob: null,
                            status: "idle",
                        }
                        : clip
                )
            );

            invalidateProcessed();
        },
        [invalidateProcessed]
    );

    const updateClipPosition = useCallback(
        (id, x, y) => {
            setClips((previous) =>
                previous.map((clip) =>
                    clip.id === id
                        ? {
                            ...clip,
                            position: {
                                x,
                                y,
                            },
                            processedUrl: null,
                            processedBlob: null,
                        }
                        : clip
                )
            );

            invalidateProcessed();
        },
        [invalidateProcessed]
    );

    const updateClipDuration = useCallback(
        (id, duration) => {
            setClips((previous) =>
                previous.map((clip) =>
                    clip.id === id
                        ? {
                            ...clip,
                            duration,
                        }
                        : clip
                )
            );
        },
        []
    );

    const applyTimingPreset = (preset) => {
        if (preset === "full") {
            setSettings((previous) => ({
                ...previous,
                entryMode: "percent",
                entryValue: 0,
                exitMode: "percent",
                exitValue: 0,
            }));
        }

        if (preset === "first25") {
            setSettings((previous) => ({
                ...previous,
                entryMode: "percent",
                entryValue: 0,
                exitMode: "percent",
                exitValue: 75,
            }));
        }

        if (preset === "last25") {
            setSettings((previous) => ({
                ...previous,
                entryMode: "percent",
                entryValue: 75,
                exitMode: "percent",
                exitValue: 0,
            }));
        }

        invalidateProcessed();
    };

    const renderClip = useCallback(
        async (clip) => {
            return new Promise(async (resolve, reject) => {
                const video = document.createElement("video");

                video.src = clip.url;
                video.preload = "auto";
                video.playsInline = true;
                video.muted = false;

                video.onloadedmetadata = async () => {
                    try {
                        const duration = video.duration;

                        let start = 0;
                        let end = duration;

                        if (settings.entryMode === "seconds") {
                            start = clamp(
                                settings.entryValue,
                                0,
                                duration
                            );
                        } else {
                            start =
                                duration *
                                clamp(
                                    settings.entryValue,
                                    0,
                                    100
                                ) /
                                100;
                        }

                        if (settings.exitMode === "seconds") {
                            end =
                                duration -
                                clamp(
                                    settings.exitValue,
                                    0,
                                    duration
                                );
                        } else {
                            end =
                                duration *
                                (1 -
                                    clamp(
                                        settings.exitValue,
                                        0,
                                        100
                                    ) /
                                    100);
                        }

                        start = clamp(start, 0, duration);
                        end = clamp(end, 0, duration);

                        if (end <= start) {
                            reject(
                                new Error(
                                    "Caption end time must be after its start time."
                                )
                            );
                            return;
                        }

                        const width = video.videoWidth;
                        const height = video.videoHeight;

                        if (!width || !height) {
                            reject(
                                new Error(
                                    "Could not read the video's dimensions."
                                )
                            );
                            return;
                        }

                        const canvas =
                            document.createElement("canvas");

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext("2d", {
                            alpha: false,
                        });

                        if (!ctx) {
                            reject(
                                new Error(
                                    "Your browser could not create a canvas renderer."
                                )
                            );
                            return;
                        }

                        const canvasStream =
                            canvas.captureStream(30);

                        await video.play();

                        const sourceStream =
                            getVideoCaptureStream(video);

                        if (!sourceStream) {
                            reject(
                                new Error(
                                    "Your browser does not support video capture. Please use the latest Chrome or Edge."
                                )
                            );
                            return;
                        }

                        video.pause();
                        video.currentTime = 0;

                        sourceStream
                            .getAudioTracks()
                            .forEach((track) => {
                                canvasStream.addTrack(track);
                            });

                        const mimeType =
                            getSupportedMimeType();

                        if (!mimeType) {
                            reject(
                                new Error(
                                    "Your browser does not support WebM video recording."
                                )
                            );
                            return;
                        }

                        const recorder = new MediaRecorder(
                            canvasStream,
                            {
                                mimeType,
                                videoBitsPerSecond: 8_000_000,
                            }
                        );

                        const chunks = [];

                        recorder.ondataavailable = (event) => {
                            if (event.data?.size) {
                                chunks.push(event.data);
                            }
                        };

                        recorder.onerror = (event) => {
                            reject(
                                event.error ||
                                new Error(
                                    "Video rendering failed."
                                )
                            );
                        };

                        recorder.onstop = () => {
                            const blob = new Blob(chunks, {
                                type: mimeType,
                            });

                            sourceStream
                                .getTracks()
                                .forEach((track) => track.stop());

                            canvasStream
                                .getTracks()
                                .forEach((track) => track.stop());

                            resolve(blob);
                        };

                        const scale = Math.min(
                            width / 1080,
                            height / 1080
                        );

                        const fontSize =
                            settings.textSize * scale;

                        const letterSpacing =
                            settings.letterSpacing * scale;

                        const lineSpacing =
                            settings.lineSpacing * scale;

                        const strokeWidth =
                            settings.strokeWidth * scale;

                        const padding = 18 * scale;

                        const maxTextWidth =
                            width * 0.86;

                        const font = `${settings.fontWeight} ${fontSize}px ${settings.fontFamily}`;

                        const transitionDuration = clamp(
                            settings.transitionDuration,
                            0.05,
                            Math.max(0.05, (end - start) / 2)
                        );

                        let stopped = false;

                        const finish = () => {
                            if (stopped) return;

                            stopped = true;

                            video.pause();

                            if (
                                recorder.state !== "inactive"
                            ) {
                                recorder.stop();
                            }
                        };

                        const drawFrame = () => {
                            if (stopped) return;

                            const currentTime =
                                video.currentTime;

                            ctx.clearRect(
                                0,
                                0,
                                width,
                                height
                            );

                            ctx.drawImage(
                                video,
                                0,
                                0,
                                width,
                                height
                            );

                            if (
                                clip.text.trim() &&
                                currentTime >= start &&
                                currentTime <= end
                            ) {
                                ctx.save();

                                ctx.font = font;
                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";

                                const lines = wrapText(
                                    ctx,
                                    clip.text,
                                    maxTextWidth,
                                    letterSpacing
                                );

                                const lineHeight =
                                    fontSize + lineSpacing;

                                const textHeight =
                                    lines.length * lineHeight;

                                const textWidths =
                                    lines.map((line) =>
                                        measureTrackedText(
                                            ctx,
                                            line,
                                            letterSpacing
                                        )
                                    );

                                const contentWidth =
                                    Math.max(...textWidths, 0);

                                const boxWidth =
                                    contentWidth +
                                    padding * 2;

                                const boxHeight =
                                    textHeight +
                                    padding * 2;

                                const positionX =
                                    (clip.position.x / 100) *
                                    width;

                                const positionY =
                                    (clip.position.y / 100) *
                                    height;

                                const entryProgress =
                                    settings.entryAnimation ===
                                        "none"
                                        ? 1
                                        : clamp(
                                            (currentTime - start) /
                                            transitionDuration,
                                            0,
                                            1
                                        );

                                const exitProgress =
                                    settings.exitAnimation ===
                                        "none"
                                        ? 0
                                        : clamp(
                                            (currentTime -
                                                (end -
                                                    transitionDuration)) /
                                            transitionDuration,
                                            0,
                                            1
                                        );

                                // FIX: this used to pass only
                                // `settings.entryAnimation`, so the exit
                                // transition dropdown had no effect — the
                                // entry animation type was silently reused
                                // for the exit phase too.
                                const animation =
                                    getAnimationState(
                                        settings.entryAnimation,
                                        settings.exitAnimation,
                                        entryProgress,
                                        exitProgress,
                                        70 * scale
                                    );

                                ctx.globalAlpha =
                                    animation.opacity;

                                ctx.translate(
                                    positionX +
                                    animation.translateX,
                                    positionY +
                                    animation.translateY
                                );

                                ctx.scale(
                                    animation.scale,
                                    animation.scale
                                );

                                if (settings.showBackground) {
                                    ctx.fillStyle =
                                        settings.backgroundColor;

                                    roundedRect(
                                        ctx,
                                        -boxWidth / 2,
                                        -boxHeight / 2,
                                        boxWidth,
                                        boxHeight,
                                        settings.backgroundRadius *
                                        scale
                                    );

                                    ctx.fill();
                                }

                                const firstLineY =
                                    -textHeight / 2 +
                                    lineHeight / 2;

                                ctx.lineJoin = "round";

                                lines.forEach((line, index) => {
                                    const lineY =
                                        firstLineY +
                                        index * lineHeight;

                                    if (settings.showStroke) {
                                        ctx.strokeStyle =
                                            settings.strokeColor;

                                        ctx.lineWidth =
                                            strokeWidth;

                                        // FIX: this branch used to be a
                                        // dead no-op (`ctx.strokeText =
                                        // ctx.strokeText`) so stroked text
                                        // never respected letter spacing —
                                        // it always drew the whole line as
                                        // one strokeText call. Now it uses
                                        // the same per-character tracked
                                        // drawing as the fill pass.
                                        if (letterSpacing === 0) {
                                            ctx.strokeText(
                                                line,
                                                0,
                                                lineY
                                            );
                                        } else {
                                            drawTrackedText(
                                                ctx,
                                                line,
                                                0,
                                                lineY,
                                                letterSpacing,
                                                "stroke"
                                            );
                                        }
                                    }

                                    ctx.fillStyle =
                                        settings.textColor;

                                    if (letterSpacing === 0) {
                                        ctx.fillText(
                                            line,
                                            0,
                                            lineY
                                        );
                                    } else {
                                        drawTrackedText(
                                            ctx,
                                            line,
                                            0,
                                            lineY,
                                            letterSpacing,
                                            "fill"
                                        );
                                    }
                                });

                                ctx.restore();
                            }

                            if (
                                video.ended ||
                                currentTime >= duration - 0.02
                            ) {
                                finish();
                                return;
                            }

                            requestAnimationFrame(
                                drawFrame
                            );
                        };

                        recorder.start(1000);

                        video.currentTime = 0;

                        await video.play();

                        requestAnimationFrame(
                            drawFrame
                        );
                    } catch (error) {
                        reject(error);
                    }
                };

                video.onerror = () => {
                    reject(
                        new Error(
                            "Could not load this video."
                        )
                    );
                };

                video.load();
            });
        },
        [settings]
    );

    const applyToAll = async () => {
        if (!clips.length || isProcessing) return;

        const clipsWithoutCaptions = clips.filter(
            (clip) => !clip.text.trim()
        );

        if (clipsWithoutCaptions.length) {
            setNotice(
                `${clipsWithoutCaptions.length} clip${clipsWithoutCaptions.length > 1
                    ? "s"
                    : ""
                } still need caption text.`
            );

            setSelectedId(
                clipsWithoutCaptions[0].id
            );

            return;
        }

        setNotice("");
        setIsProcessing(true);

        invalidateProcessed();

        setProgress({
            completed: 0,
            total: clips.length,
        });

        let completed = 0;

        for (const clip of clips) {
            setClips((previous) =>
                previous.map((item) =>
                    item.id === clip.id
                        ? {
                            ...item,
                            status: "processing",
                            error: null,
                        }
                        : item
                )
            );

            try {
                const blob = await renderClip(clip);

                const url =
                    URL.createObjectURL(blob);

                processedUrlsRef.current.add(url);

                setClips((previous) =>
                    previous.map((item) =>
                        item.id === clip.id
                            ? {
                                ...item,
                                processedUrl: url,
                                processedBlob: blob,
                                status: "done",
                                error: null,
                            }
                            : item
                    )
                );
            } catch (error) {
                setClips((previous) =>
                    previous.map((item) =>
                        item.id === clip.id
                            ? {
                                ...item,
                                status: "error",
                                error:
                                    error?.message ||
                                    "Rendering failed.",
                            }
                            : item
                    )
                );
            }

            completed += 1;

            setProgress({
                completed,
                total: clips.length,
            });
        }

        setIsProcessing(false);
    };

    const downloadClip = (clip) => {
        if (!clip.processedUrl) return;

        const anchor =
            document.createElement("a");

        anchor.href = clip.processedUrl;
        anchor.download = `${sanitizeFileName(
            clip.name
        )}-captioned.webm`;

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    const downloadAll = async () => {
        if (!processedClips.length) return;

        const zip = new JSZip();

        processedClips.forEach((clip, index) => {
            zip.file(
                `${String(index + 1).padStart(
                    2,
                    "0"
                )}-${sanitizeFileName(
                    clip.name
                )}-captioned.webm`,
                clip.processedBlob
            );
        });

        const blob = await zip.generateAsync({
            type: "blob",
            compression: "STORE",
        });

        const url =
            URL.createObjectURL(blob);

        const anchor =
            document.createElement("a");

        anchor.href = url;
        anchor.download =
            "captioned-videos.zip";

        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        return () => {
            clips.forEach((clip) => {
                if (clip.url) {
                    URL.revokeObjectURL(clip.url);
                }

                if (clip.processedUrl) {
                    URL.revokeObjectURL(
                        clip.processedUrl
                    );
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-[#F7F7F5] text-black">
            <Navbar />

            <main className="mx-auto max-w-[1600px] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                {/* HEADER */}
                <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                            PLAYGROUND
                        </div>

                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                            Bulk caption editor.
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50 sm:text-base">
                            Upload your clips, write a different caption
                            for every video, drag each caption exactly where
                            you want it, and render everything in one go.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {clips.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-black/20 hover:bg-black/[0.02]"
                            >
                                <FiTrash2 />
                                Clear all
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black/80"
                        >
                            <FiUploadCloud />
                            Add videos
                        </button>
                    </div>
                </div>

                {notice && (
                    <div className="mb-6 flex items-start gap-2 rounded-xl border border-black/15 bg-black/[0.03] px-4 py-3 text-sm font-semibold text-black/80">
                        <FiSliders className="mt-0.5 shrink-0" size={14} />
                        {notice}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = "";
                    }}
                />

                {/* UPLOAD */}
                {clips.length === 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDraggingFiles(true);
                        }}
                        onDragLeave={() =>
                            setIsDraggingFiles(false)
                        }
                        onDrop={(event) => {
                            event.preventDefault();
                            setIsDraggingFiles(false);
                            addFiles(event.dataTransfer.files);
                        }}
                        className={`mb-8 flex min-h-[360px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed transition ${isDraggingFiles
                            ? "border-black bg-black/[0.03]"
                            : "border-black/10 bg-white hover:border-black/20"
                            }`}
                    >
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/10 text-black">
                            <FiUploadCloud size={28} />
                        </div>

                        <h2 className="text-xl font-black">
                            Drop your videos here
                        </h2>

                        <p className="mt-2 text-sm text-black/45">
                            Or click anywhere to select multiple clips
                        </p>

                        <div className="mt-6 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white">
                            Select videos
                        </div>
                    </button>
                )}

                {clips.length > 0 && (
                    <>
                        {/* EDITOR */}
                        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)_360px]">
                            {/* SIDEBAR */}
                            <aside className="h-fit overflow-hidden rounded-2xl border border-black/10 bg-white lg:sticky lg:top-24">
                                <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
                                    <div>
                                        <p className="text-sm font-black">
                                            Your clips
                                        </p>

                                        <p className="mt-0.5 text-xs text-black/40">
                                            {clips.length} video
                                            {clips.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 transition hover:bg-black/[0.03]"
                                        title="Add videos"
                                        aria-label="Add videos"
                                    >
                                        <FiFilePlus />
                                    </button>
                                </div>

                                <div className="max-h-[720px] overflow-y-auto p-3">
                                    {clips.map((clip, index) => (
                                        <button
                                            key={clip.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedId(clip.id)
                                            }
                                            className={`mb-2 w-full rounded-xl border p-3 text-left transition ${selectedClip?.id === clip.id
                                                ? "border-black bg-black/[0.04]"
                                                : "border-transparent hover:bg-black/[0.03]"
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                                                    <video
                                                        src={clip.url}
                                                        muted
                                                        playsInline
                                                        preload="metadata"
                                                        className="h-full w-full object-cover"
                                                    />

                                                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[8px] font-bold text-white">
                                                        {index + 1}
                                                    </span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-bold">
                                                        {clip.name}
                                                    </p>

                                                    <p className="mt-1 truncate text-[10px] text-black/40">
                                                        {clip.text ||
                                                            "Caption not added yet"}
                                                    </p>

                                                    <div className="mt-2">
                                                        {clip.status ===
                                                            "done" && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600">
                                                                    <FiCheck />
                                                                    Rendered
                                                                </span>
                                                            )}

                                                        {clip.status ===
                                                            "processing" && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-black/70">
                                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
                                                                    Rendering...
                                                                </span>
                                                            )}

                                                        {clip.status ===
                                                            "error" && (
                                                                <span className="text-[9px] font-bold text-red-500">
                                                                    Error
                                                                </span>
                                                            )}
                                                    </div>
                                                </div>

                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={`Remove ${clip.name}`}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeClip(clip.id);
                                                    }}
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key === "Enter" ||
                                                            event.key === " "
                                                        ) {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            removeClip(clip.id);
                                                        }
                                                    }}
                                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-black/30 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <FiX size={13} />
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </aside>

                            {/* CENTER VIDEO */}
                            <section className="min-w-0">
                                {selectedClip && (
                                    <ClipEditor
                                        key={selectedClip.id}
                                        clip={selectedClip}
                                        settings={settings}
                                        onTextChange={(text) =>
                                            updateClipText(
                                                selectedClip.id,
                                                text
                                            )
                                        }
                                        onPositionChange={(x, y) =>
                                            updateClipPosition(
                                                selectedClip.id,
                                                x,
                                                y
                                            )
                                        }
                                        onDurationChange={(duration) =>
                                            updateClipDuration(
                                                selectedClip.id,
                                                duration
                                            )
                                        }
                                    />
                                )}

                                {/* RENDER */}
                                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-black">
                                                Render all clips
                                            </p>

                                            <p className="mt-1 text-xs text-black/45">
                                                Your caption settings will be applied
                                                to all {clips.length} clips.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                isProcessing ||
                                                clips.length === 0
                                            }
                                            onClick={applyToAll}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <FiRefreshCw className="animate-spin" />
                                                    Rendering{" "}
                                                    {progress.completed}/
                                                    {progress.total}
                                                </>
                                            ) : (
                                                <>
                                                    <FiZap />
                                                    Apply to {clips.length}{" "}
                                                    Clips
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {isProcessing && (
                                        <div className="mt-5">
                                            <div className="mb-2 flex justify-between text-[10px] font-bold text-black/40">
                                                <span>
                                                    Rendering videos
                                                </span>

                                                <span>
                                                    {Math.round(
                                                        (progress.completed /
                                                            Math.max(
                                                                progress.total,
                                                                1
                                                            )) *
                                                        100
                                                    )}
                                                    %
                                                </span>
                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
                                                <div
                                                    className="h-full rounded-full bg-black transition-all"
                                                    style={{
                                                        width: `${(progress.completed /
                                                            Math.max(
                                                                progress.total,
                                                                1
                                                            )) *
                                                            100
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* SETTINGS */}
                            <aside className="h-fit space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                                <div className="rounded-2xl border border-black/10 bg-white p-5">
                                    <SectionHeader
                                        icon={FiType}
                                        title="Typography"
                                        description="Global styling applied to every clip."
                                    />

                                    <div className="space-y-5">
                                        <SelectControl
                                            label="Font"
                                            value={settings.fontFamily}
                                            onChange={(value) =>
                                                updateSetting(
                                                    "fontFamily",
                                                    value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "Arial",
                                                    label: "Arial",
                                                },
                                                {
                                                    value: "Helvetica",
                                                    label: "Helvetica",
                                                },
                                                {
                                                    value: "Georgia",
                                                    label: "Georgia",
                                                },
                                                {
                                                    value: "Times New Roman",
                                                    label: "Times New Roman",
                                                },
                                                {
                                                    value: "Courier New",
                                                    label: "Courier New",
                                                },
                                            ]}
                                        />

                                        <NumberControl
                                            label="Text size"
                                            value={settings.textSize}
                                            onChange={(value) =>
                                                updateSetting(
                                                    "textSize",
                                                    value
                                                )
                                            }
                                            min={16}
                                            max={180}
                                            step={1}
                                            suffix="px"
                                        />

                                        <NumberControl
                                            label="Text thickness"
                                            value={settings.fontWeight}
                                            onChange={(value) =>
                                                updateSetting(
                                                    "fontWeight",
                                                    value
                                                )
                                            }
                                            min={100}
                                            max={900}
                                            step={100}
                                        />

                                        <ColorControl
                                            label="Text color"
                                            value={settings.textColor}
                                            onChange={(value) =>
                                                updateSetting(
                                                    "textColor",
                                                    value
                                                )
                                            }
                                        />

                                        <NumberControl
                                            label="Line spacing"
                                            value={settings.lineSpacing}
                                            onChange={(value) =>
                                                updateSetting(
                                                    "lineSpacing",
                                                    value
                                                )
                                            }
                                            min={0}
                                            max={60}
                                            step={1}
                                            suffix="px"
                                        />

                                        <NumberControl
                                            label="Letter spacing"
                                            value={
                                                settings.letterSpacing
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "letterSpacing",
                                                    value
                                                )
                                            }
                                            min={-5}
                                            max={20}
                                            step={0.5}
                                            suffix="px"
                                        />

                                        <div className="flex items-center justify-between rounded-xl border border-black/10 p-3">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Text stroke
                                                </p>
                                                <p className="text-[10px] text-black/40">
                                                    Outline the caption text
                                                </p>
                                            </div>

                                            <Toggle
                                                checked={
                                                    settings.showStroke
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        "showStroke",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>

                                        {settings.showStroke && (
                                            <div className="space-y-4">
                                                <ColorControl
                                                    label="Stroke color"
                                                    value={
                                                        settings.strokeColor
                                                    }
                                                    onChange={(value) =>
                                                        updateSetting(
                                                            "strokeColor",
                                                            value
                                                        )
                                                    }
                                                />

                                                <NumberControl
                                                    label="Stroke thickness"
                                                    value={
                                                        settings.strokeWidth
                                                    }
                                                    onChange={(value) =>
                                                        updateSetting(
                                                            "strokeWidth",
                                                            value
                                                        )
                                                    }
                                                    min={1}
                                                    max={12}
                                                    step={1}
                                                    suffix="px"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-black/10 bg-white p-5">
                                    <SectionHeader
                                        icon={FiLayers}
                                        title="Background"
                                        description="Customize the caption container."
                                    />

                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between rounded-xl border border-black/10 p-3">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    Background
                                                </p>
                                                <p className="text-[10px] text-black/40">
                                                    Show behind caption
                                                </p>
                                            </div>

                                            <Toggle
                                                checked={
                                                    settings.showBackground
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        "showBackground",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>

                                        {settings.showBackground && (
                                            <>
                                                <ColorControl
                                                    label="Background color"
                                                    value={
                                                        settings.backgroundColor
                                                    }
                                                    onChange={(value) =>
                                                        updateSetting(
                                                            "backgroundColor",
                                                            value
                                                        )
                                                    }
                                                />

                                                <NumberControl
                                                    label="Border radius"
                                                    value={
                                                        settings.backgroundRadius
                                                    }
                                                    onChange={(value) =>
                                                        updateSetting(
                                                            "backgroundRadius",
                                                            value
                                                        )
                                                    }
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    suffix="px"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-black/10 bg-white p-5">
                                    <SectionHeader
                                        icon={FiClock}
                                        title="Timing"
                                        description="Control exactly when captions appear."
                                    />

                                    <div className="mb-5 flex flex-wrap gap-2">
                                        {[
                                            ["full", "Full video"],
                                            ["first25", "First 25%"],
                                            ["last25", "Last 25%"],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() =>
                                                    applyTimingPreset(
                                                        value
                                                    )
                                                }
                                                className="rounded-lg border border-black/10 px-3 py-2 text-[10px] font-bold transition hover:border-black/30 hover:bg-black/5"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-sm font-bold">
                                                    Caption enters
                                                </p>

                                                <div className="flex overflow-hidden rounded-lg border border-black/10">
                                                    {[
                                                        ["seconds", "Sec"],
                                                        ["percent", "%"],
                                                    ].map(
                                                        ([value, label]) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() =>
                                                                    updateSetting(
                                                                        "entryMode",
                                                                        value
                                                                    )
                                                                }
                                                                className={`px-2.5 py-1.5 text-[10px] font-bold ${settings.entryMode ===
                                                                    value
                                                                    ? "bg-black text-white"
                                                                    : "bg-white text-black/40"
                                                                    }`}
                                                            >
                                                                {label}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <NumberControl
                                                label=""
                                                value={
                                                    settings.entryValue
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        "entryValue",
                                                        value
                                                    )
                                                }
                                                min={0}
                                                max={
                                                    settings.entryMode ===
                                                        "percent"
                                                        ? 100
                                                        : 300
                                                }
                                                step={0.1}
                                                suffix={
                                                    settings.entryMode ===
                                                        "percent"
                                                        ? "%"
                                                        : "s"
                                                }
                                            />
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-sm font-bold">
                                                    Caption exits
                                                </p>

                                                <div className="flex overflow-hidden rounded-lg border border-black/10">
                                                    {[
                                                        ["seconds", "Sec"],
                                                        ["percent", "%"],
                                                    ].map(
                                                        ([value, label]) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                onClick={() =>
                                                                    updateSetting(
                                                                        "exitMode",
                                                                        value
                                                                    )
                                                                }
                                                                className={`px-2.5 py-1.5 text-[10px] font-bold ${settings.exitMode ===
                                                                    value
                                                                    ? "bg-black text-white"
                                                                    : "bg-white text-black/40"
                                                                    }`}
                                                            >
                                                                {label}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <NumberControl
                                                label=""
                                                value={
                                                    settings.exitValue
                                                }
                                                onChange={(value) =>
                                                    updateSetting(
                                                        "exitValue",
                                                        value
                                                    )
                                                }
                                                min={0}
                                                max={
                                                    settings.exitMode ===
                                                        "percent"
                                                        ? 100
                                                        : 300
                                                }
                                                step={0.1}
                                                suffix={
                                                    settings.exitMode ===
                                                        "percent"
                                                        ? "% from end"
                                                        : "s from end"
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-black/10 bg-white p-5">
                                    <SectionHeader
                                        icon={FiZap}
                                        title="Transitions"
                                        description="Animate captions when they enter and exit."
                                    />

                                    <div className="space-y-4">
                                        <SelectControl
                                            label="Entry transition"
                                            value={
                                                settings.entryAnimation
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "entryAnimation",
                                                    value
                                                )
                                            }
                                            options={ANIMATIONS}
                                        />

                                        <SelectControl
                                            label="Exit transition"
                                            value={
                                                settings.exitAnimation
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "exitAnimation",
                                                    value
                                                )
                                            }
                                            options={ANIMATIONS}
                                        />

                                        <NumberControl
                                            label="Transition duration"
                                            value={
                                                settings.transitionDuration
                                            }
                                            onChange={(value) =>
                                                updateSetting(
                                                    "transitionDuration",
                                                    value
                                                )
                                            }
                                            min={0.05}
                                            max={2}
                                            step={0.05}
                                            suffix="s"
                                        />
                                    </div>
                                </div>
                            </aside>
                        </div>

                        {/* OUTPUTS */}
                        <section className="mt-16">
                            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-black/50">
                                        Output
                                    </p>

                                    <h2 className="text-3xl font-black tracking-tight">
                                        Rendered videos
                                    </h2>

                                    <p className="mt-2 text-sm text-black/45">
                                        Your processed clips will appear here.
                                    </p>
                                </div>

                                {processedClips.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={downloadAll}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-black/80"
                                    >
                                        <FiDownload />
                                        Download all
                                    </button>
                                )}
                            </div>

                            {processedClips.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-20 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black/5">
                                        <FiPlay className="text-black/30" />
                                    </div>

                                    <p className="font-bold text-black/60">
                                        No rendered videos yet
                                    </p>

                                    <p className="mt-1 text-xs text-black/35">
                                        Configure your captions and click
                                        "Apply to Clips".
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {processedClips.map((clip) => (
                                        <div
                                            key={clip.id}
                                            className="overflow-hidden rounded-2xl border border-black/10 bg-white"
                                        >
                                            <div className="aspect-[9/16] bg-black">
                                                <video
                                                    src={clip.processedUrl}
                                                    controls
                                                    playsInline
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>

                                            <div className="p-4">
                                                <p className="truncate text-sm font-bold">
                                                    {clip.name}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        downloadClip(clip)
                                                    }
                                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-xs font-black transition hover:bg-black hover:text-white"
                                                >
                                                    <FiDownload />
                                                    Download clip
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

/* -------------------------------------------------------
   INDIVIDUAL CLIP EDITOR
------------------------------------------------------- */

function ClipEditor({
    clip,
    settings,
    onTextChange,
    onPositionChange,
    onDurationChange,
}) {
    const videoRef = useRef(null);
    // FIX: this used to be a callback ref passed all the way down from
    // Playground (and reused as `previewRef` inside PositionOverlay,
    // which is what caused the drag bug). ClipEditor now just owns its
    // own local ref for the video's bounding box.
    const containerRef = useRef(null);

    const [currentTime, setCurrentTime] =
        useState(0);

    const [duration, setDuration] =
        useState(0);

    const [isPlaying, setIsPlaying] =
        useState(false);

    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
    }, [clip.id]);

    const updateTimeFromVideo = () => {
        if (!videoRef.current) return;

        setCurrentTime(
            videoRef.current.currentTime
        );
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;

        const videoDuration =
            videoRef.current.duration;

        setDuration(videoDuration);
        onDurationChange(videoDuration);
    };

    const togglePlay = async () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            await videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const seek = (value) => {
        if (!videoRef.current) return;

        videoRef.current.currentTime =
            Number(value);

        setCurrentTime(Number(value));
    };

    const captionRange = useMemo(() => {
        if (!duration) {
            return { start: 0, end: 0 };
        }

        let start = 0;
        let end = duration;

        if (settings.entryMode === "seconds") {
            start = settings.entryValue;
        } else {
            start =
                (duration * settings.entryValue) /
                100;
        }

        if (settings.exitMode === "seconds") {
            end =
                duration - settings.exitValue;
        } else {
            end =
                duration *
                (1 - settings.exitValue / 100);
        }

        return {
            start: clamp(start, 0, duration),
            end: clamp(end, 0, duration),
        };
    }, [
        duration,
        settings.entryMode,
        settings.entryValue,
        settings.exitMode,
        settings.exitValue,
    ]);

    return (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            {/* VIDEO */}
            <div className="relative flex max-h-[720px] min-h-[450px] items-center justify-center bg-[#111] p-3 sm:p-6">
                <div
                    ref={containerRef}
                    className="relative max-h-[680px] w-full max-w-[760px] overflow-hidden rounded-xl bg-black shadow-2xl"
                    style={{
                        aspectRatio:
                            videoRef.current?.videoWidth &&
                                videoRef.current?.videoHeight
                                ? `${videoRef.current.videoWidth}/${videoRef.current.videoHeight}`
                                : "9 / 16",
                    }}
                >
                    <video
                        ref={videoRef}
                        src={clip.url}
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={
                            handleLoadedMetadata
                        }
                        onTimeUpdate={
                            updateTimeFromVideo
                        }
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="block h-full w-full object-contain"
                    />

                    <PositionOverlay
                        clip={clip}
                        settings={settings}
                        currentTime={currentTime}
                        duration={duration}
                        onPositionChange={
                            onPositionChange
                        }
                    />
                </div>
            </div>

            {/* ACTUAL TIMELINE */}
            <div className="border-t border-black/10 px-4 py-4 sm:px-6">
                <div className="mb-3 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <span className="text-xs">Ⅱ</span>
                        ) : (
                            <FiPlay size={13} />
                        )}
                    </button>

                    <span className="w-12 text-xs font-bold tabular-nums text-black/60">
                        {formatTime(currentTime)}
                    </span>

                    <div className="relative flex-1">
                        {/* CAPTION RANGE */}
                        {duration > 0 && (
                            <div
                                className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 h-1.5 -translate-y-1/2 rounded-full bg-black/5"
                            >
                                <div
                                    className="absolute h-full rounded-full bg-black/25"
                                    style={{
                                        left: `${(captionRange.start /
                                            duration) *
                                            100
                                            }%`,
                                        width: `${((captionRange.end -
                                            captionRange.start) /
                                            duration) *
                                            100
                                            }%`,
                                    }}
                                />
                            </div>
                        )}

                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.01}
                            value={currentTime}
                            onChange={(event) =>
                                seek(event.target.value)
                            }
                            className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent accent-black"
                        />
                    </div>

                    <span className="w-12 text-right text-xs font-bold tabular-nums text-black/40">
                        {formatTime(duration)}
                    </span>
                </div>

                {/* REAL TIMELINE MARKERS */}
                {duration > 0 && (
                    <div className="relative ml-12 mr-12 h-4 text-[9px] font-semibold text-black/30">
                        <span className="absolute left-0">
                            00:00
                        </span>

                        <span className="absolute left-1/2 -translate-x-1/2">
                            {formatTime(duration / 2)}
                        </span>

                        <span className="absolute right-0">
                            {formatTime(duration)}
                        </span>
                    </div>
                )}
            </div>

            {/* CAPTION FIELD */}
            <div className="border-t border-black/10 bg-[#FAFAF9] p-4 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <label className="text-sm font-black">
                            Caption for this clip
                        </label>

                        <p className="mt-0.5 text-[11px] text-black/40">
                            This text is unique to this video.
                        </p>
                    </div>

                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-black/35">
                        {clip.text.length} characters
                    </span>
                </div>

                <textarea
                    value={clip.text}
                    onChange={(event) =>
                        onTextChange(event.target.value)
                    }
                    placeholder="Write the caption for this video..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-black/25 focus:border-black"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-black/40">
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1">
                        Drag caption directly on video
                    </span>

                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1">
                        Position:{" "}
                        {Math.round(clip.position.x)}% ×{" "}
                        {Math.round(clip.position.y)}%
                    </span>
                </div>
            </div>
        </div>
    );
}