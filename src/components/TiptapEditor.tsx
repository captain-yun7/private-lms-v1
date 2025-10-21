'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useCallback } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('이미지 URL을 입력하세요:');

    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {editable && (
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('bold')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('italic')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('strike')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Strike
          </button>

          {/* Headings */}
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            H3
          </button>

          {/* Lists */}
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bullet List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ordered List
          </button>

          {/* Quote & Code */}
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('codeBlock')
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Code
          </button>

          {/* Image */}
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={addImage}
            className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Image
          </button>

          {/* Undo/Redo */}
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Redo
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
