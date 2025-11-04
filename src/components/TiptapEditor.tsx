'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { useCallback, useState, useEffect } from 'react';

// FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

// LineHeight Extension
const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ chain }) => {
        return chain().setMark('textStyle', { lineHeight }).run();
      },
      unsetLineHeight: () => ({ chain }) => {
        return chain().setMark('textStyle', { lineHeight: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

// LetterSpacing Extension
const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: element => element.style.letterSpacing.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.letterSpacing) {
                return {};
              }
              return {
                style: `letter-spacing: ${attributes.letterSpacing}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLetterSpacing: (letterSpacing: string) => ({ chain }) => {
        return chain().setMark('textStyle', { letterSpacing }).run();
      },
      unsetLetterSpacing: () => ({ chain }) => {
        return chain().setMark('textStyle', { letterSpacing: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

// Resizable Image Extension
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
    };
  },
});

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
  const [fontSize, setFontSize] = useState('16');
  const [lineHeight, setLineHeight] = useState('normal');
  const [letterSpacing, setLetterSpacing] = useState('0');
  const [isDragging, setIsDragging] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      LineHeight,
      LetterSpacing,
      Placeholder.configure({
        placeholder,
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg cursor-pointer',
        },
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
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

  // Image resize functionality
  useEffect(() => {
    if (!editor || !editable) return;

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;

        // Remove existing resize handles
        document.querySelectorAll('.image-resize-handle').forEach(el => el.remove());
        document.querySelectorAll('.image-resizing').forEach(el => {
          el.classList.remove('image-resizing');
        });

        // Add resizing class
        img.classList.add('image-resizing');

        // Create resize handle
        const handle = document.createElement('div');
        handle.className = 'image-resize-handle';
        handle.style.cssText = `
          position: absolute;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          cursor: nwse-resize;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 1000;
        `;

        // Position handle at bottom-right
        const rect = img.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        handle.style.left = `${rect.left + scrollLeft + rect.width - 6}px`;
        handle.style.top = `${rect.top + scrollTop + rect.height - 6}px`;

        document.body.appendChild(handle);

        // Store original dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;
        const aspectRatio = originalWidth / originalHeight;

        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = originalWidth;

        const onMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = img.width;
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;

          const deltaX = e.clientX - startX;
          const newWidth = Math.max(100, Math.min(800, startWidth + deltaX));
          const newHeight = newWidth / aspectRatio;

          img.width = newWidth;
          img.height = newHeight;
          img.setAttribute('width', String(newWidth));
          img.setAttribute('height', String(newHeight));

          // Update handle position
          const rect = img.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          handle.style.left = `${rect.left + scrollLeft + rect.width - 6}px`;
          handle.style.top = `${rect.top + scrollTop + rect.height - 6}px`;
        };

        const onMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            // Update the editor content
            if (editor) {
              const html = editor.getHTML();
              onChange(html);
            }
          }
        };

        handle.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Cleanup on next click or editor update
        const cleanup = () => {
          handle.remove();
          img.classList.remove('image-resizing');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        // Store cleanup function
        (handle as any)._cleanup = cleanup;
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'IMG' && !target.classList.contains('image-resize-handle')) {
        document.querySelectorAll('.image-resize-handle').forEach(el => {
          if ((el as any)._cleanup) {
            (el as any)._cleanup();
          }
        });
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleImageClick);
    document.addEventListener('click', handleClickOutside);

    return () => {
      editorElement.removeEventListener('click', handleImageClick);
      document.removeEventListener('click', handleClickOutside);
      document.querySelectorAll('.image-resize-handle').forEach(el => {
        if ((el as any)._cleanup) {
          (el as any)._cleanup();
        }
      });
    };
  }, [editor, editable, onChange]);

  const uploadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
  }, [editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await uploadImage(file);
      }
    };
    input.click();
  }, [uploadImage]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden relative transition-all ${
        isDragging
          ? 'border-blue-500 border-2 bg-blue-50'
          : 'border-gray-300'
      }`}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          uploadImage(file);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold text-blue-600">이미지를 여기에 드롭하세요</p>
            <p className="text-sm text-blue-500 mt-2">PNG, JPG, GIF, WebP (최대 5MB)</p>
          </div>
        </div>
      )}
      {editable && (
        <div className="bg-white border-b border-gray-200 p-3 flex flex-wrap items-center gap-1">
          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => {
              const size = e.target.value;
              setFontSize(size);
              if (editor) {
                editor.chain().focus().setFontSize(size).run();
              }
            }}
            className="h-9 px-3 rounded-md text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="글자 크기"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
          </select>

          {/* Line Height */}
          <select
            value={lineHeight}
            onChange={(e) => {
              const height = e.target.value;
              setLineHeight(height);
              if (editor) {
                editor.chain().focus().setLineHeight(height).run();
              }
            }}
            className="h-9 px-3 rounded-md text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="줄 간격"
          >
            <option value="normal">줄간격 기본</option>
            <option value="0.8">줄간격 0.8</option>
            <option value="0.9">줄간격 0.9</option>
            <option value="1.0">줄간격 1.0</option>
            <option value="1.1">줄간격 1.1</option>
            <option value="1.2">줄간격 1.2</option>
            <option value="1.3">줄간격 1.3</option>
            <option value="1.4">줄간격 1.4</option>
            <option value="1.5">줄간격 1.5</option>
            <option value="1.6">줄간격 1.6</option>
            <option value="1.8">줄간격 1.8</option>
            <option value="2.0">줄간격 2.0</option>
            <option value="2.5">줄간격 2.5</option>
            <option value="3.0">줄간격 3.0</option>
          </select>

          {/* Letter Spacing */}
          <select
            value={letterSpacing}
            onChange={(e) => {
              const spacing = e.target.value;
              setLetterSpacing(spacing);
              if (editor) {
                editor.chain().focus().setLetterSpacing(spacing).run();
              }
            }}
            className="h-9 px-3 rounded-md text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="자간"
          >
            <option value="-1">자간 -1px</option>
            <option value="0">자간 0px</option>
            <option value="0.5">자간 0.5px</option>
            <option value="1">자간 1px</option>
            <option value="1.5">자간 1.5px</option>
            <option value="2">자간 2px</option>
            <option value="3">자간 3px</option>
          </select>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('bold')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="굵게 (Ctrl+B)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('italic')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="기울임 (Ctrl+I)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h8m-4 0v16m-4 0h8" transform="skewX(-10)" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('strike')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="취소선"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M8 8h8M9 16h6" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-base transition-all ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="제목 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm transition-all ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="제목 3"
          >
            H3
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('bulletList')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="글머리 기호 목록"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              <circle cx="4" cy="6" r="1.5" fill="currentColor" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" />
              <circle cx="4" cy="18" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('orderedList')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="번호 매기기 목록"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11M3 6h.01M3 12h.01M3 18h.01" />
              <text x="3" y="7" fontSize="6" fontWeight="bold" fill="currentColor">1</text>
              <text x="3" y="13" fontSize="6" fontWeight="bold" fill="currentColor">2</text>
              <text x="3" y="19" fontSize="6" fontWeight="bold" fill="currentColor">3</text>
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Quote & Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('blockquote')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="인용문"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M8 10V6a2 2 0 012-2h4a2 2 0 012 2v4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              editor.isActive('codeBlock')
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="코드 블록"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Image */}
          <button
            type="button"
            onClick={handleImageUpload}
            className="w-9 h-9 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
            title="이미지 업로드 (또는 드래그앤드롭)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="w-9 h-9 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title="실행 취소 (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="w-9 h-9 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title="다시 실행 (Ctrl+Y)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
