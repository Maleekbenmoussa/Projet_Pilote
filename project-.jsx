import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileUploader({ onFilesUpload, cvCount }) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert('Certains fichiers ne sont pas supportés. Formats acceptés: PDF, DOCX, TXT');
    }

    if (acceptedFiles.length > 0) {
      onFilesUpload(acceptedFiles);
    }
  }, [onFilesUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 50
  });

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-text">📄 Upload CVs</h2>
        {cvCount > 0 && (
          <span className="bg-primary-cta text-neutral-text px-4 py-2 rounded-full text-sm font-semibold">
            {cvCount} CV{cvCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 transform
          ${isDragActive
            ? 'border-primary-cta bg-primary-bg scale-105 shadow-soft-lg'
            : 'border-neutral-text-secondary/30 bg-primary-bg/50 hover:border-primary-cta hover:bg-primary-bg hover:shadow-soft'}`}
      >
        <input {...getInputProps()} />

        <div className={`mx-auto h-20 w-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-200
          ${isDragActive ? 'bg-primary-cta scale-110' : 'bg-primary-cta'}`}>
          <svg
            className="h-10 w-10 text-neutral-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <p className="text-xl font-semibold text-neutral-text mb-3">
          {isDragActive ? 'Drop CVs here' : 'Drag & drop CVs here'}
        </p>

        <p className="text-neutral-text-secondary mb-4">
          or click to browse files
        </p>

        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="px-3 py-2 bg-neutral-card rounded-xl text-neutral-text-secondary border border-neutral-text-secondary/20">PDF</span>
          <span className="px-3 py-2 bg-neutral-card rounded-xl text-neutral-text-secondary border border-neutral-text-secondary/20">DOCX</span>
          <span className="px-3 py-2 bg-neutral-card rounded-xl text-neutral-text-secondary border border-neutral-text-secondary/20">TXT</span>
        </div>

        <p className="text-sm text-neutral-text-secondary/60 mt-4">
          Maximum 50 files
        </p>
      </div>
    </div>
  );
}

export default FileUploader;