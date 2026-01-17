'use client';

import { useState, useEffect } from 'react';
import {
  Folder,
  File,
  FileText,
  FileCode,
  FileJson,
  FileImage,
  Home,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'json') return <FileJson className="w-5 h-5 text-yellow-600" />;
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go'].includes(ext || ''))
    return <FileCode className="w-5 h-5 text-blue-600" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || ''))
    return <FileImage className="w-5 h-5 text-green-600" />;
  if (['md', 'txt', 'log'].includes(ext || ''))
    return <FileText className="w-5 h-5 text-gray-600" />;

  return <File className="w-5 h-5 text-gray-500" />;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function FilesPage() {
  const [currentPath, setCurrentPath] = useState(process.cwd?.() || '.');
  const [rootPath, setRootPath] = useState('.');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get root path from API
    fetch('/api/files/root')
      .then(res => res.json())
      .then(data => {
        if (data.root) {
          setRootPath(data.root);
          setCurrentPath(data.root);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentPath) {
      loadFiles(currentPath);
    }
  }, [currentPath]);

  async function loadFiles(path: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load files');
      }

      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function navigateToPath(path: string) {
    setCurrentPath(path);
  }

  function goToParent() {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      const parentPath = parts.join('/') || '/';
      navigateToPath(parentPath);
    }
  }

  function goToRoot() {
    navigateToPath(rootPath);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-medium text-gsc-text-primary mb-2">
          File Manager
        </h1>
        <p className="text-gsc-text-secondary">
          Browse your project files
        </p>
      </div>

      {/* Path Navigation */}
      <div className="bg-gsc-surface border border-gsc-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={goToRoot}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go to root"
          >
            <Home className="w-4 h-4 text-gsc-text-secondary" />
          </button>

          <button
            onClick={goToParent}
            disabled={currentPath === rootPath}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Go to parent directory"
          >
            <ArrowLeft className="w-4 h-4 text-gsc-text-secondary" />
          </button>

          <button
            onClick={() => loadFiles(currentPath)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gsc-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex-1 ml-2">
            <div className="text-sm font-mono text-gsc-text-primary bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {currentPath}
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-gsc-surface border border-gsc-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-gsc-blue animate-spin mx-auto mb-4" />
            <p className="text-gsc-text-secondary">Loading files...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadFiles(currentPath)}
              className="px-4 py-2 bg-gsc-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gsc-text-secondary">This directory is empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gsc-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsc-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsc-text-secondary uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gsc-text-secondary uppercase tracking-wider">
                    Modified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gsc-border">
                {files
                  .sort((a, b) => {
                    // Directories first
                    if (a.type === 'directory' && b.type === 'file') return -1;
                    if (a.type === 'file' && b.type === 'directory') return 1;
                    // Then alphabetically
                    return a.name.localeCompare(b.name);
                  })
                  .map((file) => (
                    <tr
                      key={file.path}
                      onClick={() => file.type === 'directory' && navigateToPath(file.path)}
                      className={`hover:bg-gray-50 transition-colors ${
                        file.type === 'directory' ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {file.type === 'directory' ? (
                            <Folder className="w-5 h-5 text-blue-600" />
                          ) : (
                            getFileIcon(file.name)
                          )}
                          <span className={`text-sm ${
                            file.type === 'directory'
                              ? 'font-medium text-gsc-blue'
                              : 'text-gsc-text-primary'
                          }`}>
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gsc-text-secondary font-mono">
                          {file.type === 'directory' ? '-' : formatFileSize(file.size)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gsc-text-secondary">
                          {formatDate(file.modified)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {!loading && !error && files.length > 0 && (
        <div className="mt-4 text-sm text-gsc-text-secondary">
          {files.filter(f => f.type === 'directory').length} folders, {files.filter(f => f.type === 'file').length} files
        </div>
      )}
    </div>
  );
}
