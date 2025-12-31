import { useState, useRef, useCallback } from 'react';
import { useImageExtraction, BPExtractionResult, GlucoseExtractionResult } from '../../hooks';

interface ImageCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'bp' | 'glucose';
    onValuesExtracted: (result: BPExtractionResult | GlucoseExtractionResult) => void;
}

export function ImageCaptureModal({ isOpen, onClose, type, onValuesExtracted }: ImageCaptureModalProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isLoading, error, result, extractFromImage, reset } = useImageExtraction({ type });

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setShowResults(false);
                reset();
            };
            reader.readAsDataURL(file);
        }
    }, [reset]);

    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleExtract = async () => {
        if (!imagePreview) return;

        const extractedResult = await extractFromImage(imagePreview);
        setShowResults(true);

        if (extractedResult) {
            // Auto-apply after short delay to show the result
            setTimeout(() => {
                onValuesExtracted(extractedResult);
                handleClose();
            }, 1500);
        }
    };

    const handleUseValues = () => {
        if (result) {
            onValuesExtracted(result);
            handleClose();
        }
    };

    const handleClose = () => {
        setImagePreview(null);
        setShowResults(false);
        reset();
        onClose();
    };

    const handleRetake = () => {
        setImagePreview(null);
        setShowResults(false);
        reset();
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-t-3xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                        {type === 'bp' ? 'Scan BP Monitor' : 'Scan Glucose Meter'}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Camera/Image Preview Area */}
                    <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Captured"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <span className="material-symbols-outlined text-5xl text-primary">
                                        photo_camera
                                    </span>
                                </div>
                                <div className="text-center px-6">
                                    <p className="text-text-primary-light dark:text-text-primary-dark font-medium">
                                        Take a photo of your {type === 'bp' ? 'BP monitor' : 'glucose meter'}
                                    </p>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                                        Make sure the screen is clearly visible
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-white font-medium">Analyzing image...</p>
                            </div>
                        )}

                        {/* Success overlay */}
                        {showResults && result && !isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <span className="material-symbols-outlined text-3xl text-white">check</span>
                                </div>
                                <p className="text-white font-bold text-lg">Values Detected!</p>
                                {type === 'bp' && 'systolic' in result && (
                                    <div className="text-white text-center">
                                        <p className="text-4xl font-bold">
                                            {result.systolic ?? '--'}/{result.diastolic ?? '--'}
                                        </p>
                                        <p className="text-sm opacity-80 mt-1">mmHg</p>
                                        {result.pulse && (
                                            <p className="text-lg mt-2">Pulse: {result.pulse} BPM</p>
                                        )}
                                    </div>
                                )}
                                {type === 'glucose' && 'value' in result && (
                                    <div className="text-white text-center">
                                        <p className="text-4xl font-bold">{result.value ?? '--'}</p>
                                        <p className="text-sm opacity-80 mt-1">mg/dL</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error overlay */}
                        {showResults && error && !isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4">
                                <div className="p-3 bg-red-500 rounded-full">
                                    <span className="material-symbols-outlined text-3xl text-white">error</span>
                                </div>
                                <p className="text-white font-bold text-lg text-center">Couldn't Extract Values</p>
                                <p className="text-white/80 text-sm text-center max-w-[250px]">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        {!imagePreview ? (
                            <button
                                onClick={handleCapture}
                                className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined">photo_camera</span>
                                Take Photo
                            </button>
                        ) : !showResults ? (
                            <>
                                <button
                                    onClick={handleExtract}
                                    disabled={isLoading}
                                    className="w-full h-14 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Extract Values with AI
                                </button>
                                <button
                                    onClick={handleRetake}
                                    className="w-full h-12 bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">refresh</span>
                                    Retake Photo
                                </button>
                            </>
                        ) : error ? (
                            <>
                                <button
                                    onClick={handleRetake}
                                    className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined">refresh</span>
                                    Try Again
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="w-full h-12 bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                    Enter Manually
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleUseValues}
                                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined">check</span>
                                    Use These Values
                                </button>
                                <button
                                    onClick={handleRetake}
                                    className="w-full h-12 bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">refresh</span>
                                    Retake Photo
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Safe area padding */}
                <div className="h-8" />
            </div>
        </div>
    );
}
