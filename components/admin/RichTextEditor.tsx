import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={`border rounded-lg dark:border-neutral-700 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-2 py-1 text-sm font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-2 py-1 text-sm italic hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-2 py-1 text-sm underline hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h2')}
          className="px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'p')}
          className="px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Paragraph"
        >
          P
        </button>
        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Numbered List"
        >
          1.
        </button>
        <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('createLink', prompt('Enter URL:') || undefined)}
          className="px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          title="Link"
        >
          🔗
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 focus:outline-none dark:text-white"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
