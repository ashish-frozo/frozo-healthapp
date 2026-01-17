import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Modal, ToggleSwitch, LabTranslationModal } from '../components/ui';
import { useLabTranslator } from '../hooks';
import { Document } from '../types';

export function DocumentsPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const navigate = useNavigate();
    const { state, toggleDocumentVisitPack } = useApp();
    const { translateLabReport, isLoading, error, translation, reset } = useLabTranslator();
    const [isTranslationOpen, setIsTranslationOpen] = useState(false);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'prescription', label: 'Prescriptions' },
        { id: 'lab_result', label: 'Lab Results' },
        { id: 'insurance', label: 'Insurance' },
    ];

    const filteredDocs = state.documents.filter(doc => {
        if (activeFilter === 'all') return true;
        return doc.category === activeFilter;
    });

    // Group by date (recent vs older)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentDocs = filteredDocs.filter(d => new Date(d.date) >= thirtyDaysAgo);
    const olderDocs = filteredDocs.filter(d => new Date(d.date) < thirtyDaysAgo);

    const getCategoryColor = (category: Document['category']) => {
        switch (category) {
            case 'lab_result': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'prescription': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'insurance': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'bill': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getCategoryIcon = (category: Document['category']) => {
        switch (category) {
            case 'lab_result': return 'picture_as_pdf';
            case 'prescription': return 'prescriptions';
            case 'insurance': return 'folder';
            case 'bill': return 'receipt';
            default: return 'description';
        }
    };

    const getCategoryIconBg = (category: Document['category']) => {
        switch (category) {
            case 'lab_result': return 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400';
            case 'prescription': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
            case 'insurance': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400';
            default: return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400';
        }
    };

    const renderDocCard = (doc: Document, isOlder = false) => (
        <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className={`group flex items-center gap-4 bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all text-left ${isOlder ? 'opacity-80' : ''}`}
        >
            {/* Thumbnail */}
            <div className={`relative shrink-0 flex items-center justify-center size-16 rounded-lg ${doc.thumbnailUrl ? 'overflow-hidden' : getCategoryIconBg(doc.category)
                }`}>
                {doc.thumbnailUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-80"
                        style={{ backgroundImage: `url(${doc.thumbnailUrl})` }}
                    />
                ) : (
                    <span className="material-symbols-outlined text-3xl">{getCategoryIcon(doc.category)}</span>
                )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-semibold leading-tight line-clamp-1">
                        {doc.title}
                    </h3>
                    {doc.inVisitPack && (
                        <span className="material-symbols-outlined text-amber-400 text-xl ml-2" title="In Visit Pack">stars</span>
                    )}
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium mt-1">
                    {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(doc.category)}`}>
                        {doc.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                </div>
            </div>

            <div className="shrink-0 text-gray-400">
                <span className="material-symbols-outlined">chevron_right</span>
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24 max-w-md mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between p-6 pb-2 shrink-0 bg-background-light dark:bg-background-dark z-10">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Documents</h1>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <span className="material-symbols-outlined">search</span>
                </button>
            </header>

            {/* Filter Chips */}
            <div className="w-full shrink-0">
                <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar items-center">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex h-10 shrink-0 items-center justify-center px-5 rounded-full transition-transform active:scale-95 ${activeFilter === filter.id
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-secondary-light dark:text-text-secondary-dark'
                                }`}
                        >
                            <span className={`text-sm ${activeFilter === filter.id ? 'font-semibold' : 'font-medium'}`}>
                                {filter.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                <div className="flex flex-col gap-3">
                    {recentDocs.length > 0 && (
                        <>
                            <p className="px-2 mt-2 text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">
                                Recent
                            </p>
                            {recentDocs.map(doc => renderDocCard(doc))}
                        </>
                    )}

                    {olderDocs.length > 0 && (
                        <>
                            <p className="px-2 mt-4 text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide">
                                Older
                            </p>
                            {olderDocs.map(doc => renderDocCard(doc, true))}
                        </>
                    )}

                    {filteredDocs.length === 0 && (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">folder_off</span>
                            <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">No documents found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FAB */}
            <div className="fixed bottom-24 right-6 z-20" style={{ right: 'max(1.5rem, calc((100vw - 28rem) / 2 + 1.5rem))' }}>
                <button
                    onClick={() => navigate('/add-document')}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white pl-4 pr-6 py-4 rounded-2xl shadow-lg shadow-primary/40 transition-transform active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span className="font-bold text-base">Add Document</span>
                </button>
            </div>

            {/* Document Detail Modal */}
            <Modal
                isOpen={!!selectedDoc}
                onClose={() => setSelectedDoc(null)}
                title={selectedDoc?.title}
            >
                {selectedDoc && (
                    <div className="px-6 pt-4 pb-8">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark font-medium mb-4">
                            {new Date(selectedDoc.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>

                        {/* Visit Pack Toggle */}
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl mb-6 border border-blue-100 dark:border-blue-900/20">
                            <div className="flex flex-col pr-4">
                                <div className="flex items-center gap-2 text-primary dark:text-blue-400 font-bold text-lg mb-1">
                                    <span className="material-symbols-outlined text-[20px]">briefcase</span>
                                    Include in Visit Pack
                                </div>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-snug">
                                    Enable to highlight this document for your next doctor's appointment.
                                </p>
                            </div>
                            <ToggleSwitch
                                checked={selectedDoc.inVisitPack}
                                onChange={() => {
                                    toggleDocumentVisitPack(selectedDoc.id);
                                    setSelectedDoc({ ...selectedDoc, inVisitPack: !selectedDoc.inVisitPack });
                                }}
                            />
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {selectedDoc.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Preview Placeholder */}
                        <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-col gap-3 relative overflow-hidden group cursor-pointer">
                            <div className="absolute inset-x-8 top-8 bottom-8 bg-surface-light dark:bg-surface-dark shadow-sm flex flex-col p-8 gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-600 rounded" />
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-600 rounded" />
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-600 rounded" />
                                <div className="h-2 w-2/3 bg-gray-100 dark:bg-gray-600 rounded" />
                            </div>
                            <div className="z-10 flex flex-col items-center">
                                <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">visibility</span>
                                <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">Tap to view PDF</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark font-semibold">
                                <span className="material-symbols-outlined">share</span>
                                Share
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark font-semibold">
                                <span className="material-symbols-outlined">print</span>
                                Print
                            </button>
                        </div>

                        {/* AI Translator Button */}
                        {selectedDoc.category === 'lab_result' && (
                            <button
                                onClick={() => {
                                    setIsTranslationOpen(true);
                                    if (selectedDoc.thumbnailUrl) {
                                        translateLabReport(selectedDoc.thumbnailUrl);
                                    }
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold border-2 border-primary/20 transition-all active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined filled">auto_awesome</span>
                                Translate with AI
                            </button>
                        )}
                    </div>
                )}
            </Modal>

            <LabTranslationModal
                isOpen={isTranslationOpen}
                onClose={() => {
                    setIsTranslationOpen(false);
                    reset();
                }}
                isLoading={isLoading}
                error={error}
                translation={translation}
            />
        </div>
    );
}
