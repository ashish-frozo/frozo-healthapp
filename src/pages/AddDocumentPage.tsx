import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Document } from '../types';
import { healthService } from '../services/healthService';

type Category = Document['category'];

export function AddDocumentPage() {
    const [category, setCategory] = useState<Category>('prescription');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { dispatch, state } = useApp();

    const categories: { value: Category; label: string }[] = [
        { value: 'prescription', label: 'Prescription' },
        { value: 'lab_result', label: 'Lab Result' },
        { value: 'bill', label: 'Bill' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'other', label: 'Other' },
    ];

    const handleScan = () => {
        // For now, we'll just simulate a scan by triggering the upload flow
        // In a real app, this would open the camera
        handleUpload();
    };

    const handleUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        input.onchange = async () => {
            if (input.files && input.files[0] && state.currentProfileId) {
                setLoading(true);
                try {
                    const formData = new FormData();
                    formData.append('file', input.files[0]);
                    formData.append('profileId', state.currentProfileId);
                    formData.append('category', category);
                    formData.append('date', date || new Date().toISOString().split('T')[0]);
                    formData.append('title', input.files[0].name.replace(/\.[^/.]+$/, ''));

                    const newDoc = await healthService.addDocument(formData);
                    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
                    navigate('/documents');
                } catch (error) {
                    console.error('Upload error:', error);
                    alert('Failed to upload document. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };
        input.click();
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-transparent dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-[28px]">close</span>
                </button>
                <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
                    Add New Record
                </h2>
            </div>

            {/* Headline */}
            <div className="pt-2 pb-4">
                <h2 className="text-text-primary-light dark:text-text-primary-dark tracking-tight text-3xl font-bold leading-tight px-6 text-center">
                    How would you like to add this file?
                </h2>
            </div>

            {/* Action Cards */}
            <div className="px-4 flex flex-col gap-4">
                {/* Scan Card */}
                <button
                    onClick={handleScan}
                    className="w-full text-left group transition-transform active:scale-[0.98]"
                >
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:shadow-md transition-all">
                        <div className="flex flex-col gap-1 flex-1">
                            <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                Scan Document
                            </p>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
                                Use your camera to scan
                            </p>
                        </div>
                        <div className="size-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                            <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                        </div>
                    </div>
                </button>

                {/* Upload Card */}
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full text-left group transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/50 hover:shadow-md transition-all">
                        <div className="flex flex-col gap-1 flex-1">
                            <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                {loading ? 'Uploading...' : 'Upload PDF'}
                            </p>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
                                {loading ? 'Please wait while we process your file' : 'Select a file from your device'}
                            </p>
                        </div>
                        <div className="size-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                            {loading ? (
                                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[32px]">upload_file</span>
                            )}
                        </div>
                    </div>
                </button>
            </div>

            <div className="h-6" />

            {/* Metadata Form */}
            <div className="px-5 flex flex-col gap-6">
                {/* Category Section */}
                <div>
                    <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-tight text-left pb-3">
                        Category <span className="text-primary text-sm font-normal ml-1">(Required)</span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`inline-block rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all ${category === cat.value
                                    ? 'bg-primary text-white border border-primary'
                                    : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark border border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Section */}
                <div>
                    <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-tight text-left pb-3">
                        Date <span className="text-gray-400 dark:text-gray-500 text-sm font-normal ml-1">(Optional)</span>
                    </h2>
                    <div className="relative group">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-primary-light dark:text-text-primary-dark p-4 font-medium shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            style={{ minHeight: '3.5rem' }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary bg-surface-light dark:bg-surface-dark pl-2">
                            <span className="material-symbols-outlined">calendar_today</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
