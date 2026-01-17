'use client';

import { useState, useEffect } from 'react';
import { FileText, Save, RotateCcw } from 'lucide-react';

export default function ClaudeMdPage() {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/claude-md')
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setOriginalContent(data.content || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/claude-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setOriginalContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Error saving');
    }
    setSaving(false);
  };

  const handleReset = () => {
    setContent(originalContent);
  };

  const hasChanges = content !== originalContent;

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-gray-700" />
          <div>
            <h1 className="text-2xl font-bold">CLAUDE.md</h1>
            <p className="text-gray-500 text-sm">Workspace context for Claude Code</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              saved
                ? 'bg-green-600'
                : hasChanges
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-180px)]">
        {/* Editor */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-gray-500">Editor</span>
            {hasChanges && <span className="text-xs text-orange-500 font-medium">modified</span>}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="# BORD Workspace..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 shrink-0">
            <span className="text-xs font-mono text-gray-500">Preview</span>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-transparent p-0 m-0">
                {content || 'No content yet...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
