import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import Underline from '@tiptap/extension-underline';
import './RichTextEditor.css';

const EMPTY_CONTENT = '<p></p>';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function hasHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeContent(value) {
  const content = String(value || '').trim();
  if (!content) return EMPTY_CONTENT;
  if (hasHtml(content)) return content;

  return content
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function ToolbarButton({ active = false, disabled = false, label, onClick, title }) {
  return (
    <button
      type="button"
      className={active ? 'active' : ''}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="rich-editor-divider" aria-hidden="true" />;
}

export default function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  label,
  placeholder,
  disabled = false,
}) {
  const imageInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          loading: 'lazy',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizeContent(value),
    editable: !disabled,
    onUpdate({ editor: activeEditor }) {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = normalizeContent(value);
    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent, false);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('请输入链接地址', previousUrl);
    if (url === null) return;

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmedUrl }).run();
  }, [editor]);

  const insertImageByUrl = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('请输入图片地址');
    if (!url?.trim()) return;

    editor.chain().focus().setImage({ src: url.trim() }).run();
  }, [editor]);

  const handleImageSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor || !onUploadImage) return;

    setImageUploading(true);
    try {
      const image = await onUploadImage(file);
      if (image?.url) {
        editor.chain().focus().setImage({ src: image.url, alt: file.name }).run();
      }
    } finally {
      setImageUploading(false);
    }
  }, [editor, onUploadImage]);

  if (!editor) {
    return (
      <div className="rich-editor-field">
        <span>{label}</span>
        <div className="rich-editor-shell loading">正在加载编辑器...</div>
      </div>
    );
  }

  return (
    <div className="rich-editor-field">
      <span>{label}</span>
      <div className="rich-editor-shell">
        <div className="rich-editor-toolbar" role="toolbar" aria-label={`${label} 工具栏`}>
          <ToolbarButton
            label="P"
            title="正文段落"
            active={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
          />
          <ToolbarButton
            label="H2"
            title="二级标题"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            label="H3"
            title="三级标题"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="B"
            title="加粗"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="I"
            title="斜体"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="U"
            title="下划线"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            label="S"
            title="删除线"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="•"
            title="项目符号列表"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="1."
            title="编号列表"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="❝"
            title="引用"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="链"
            title="插入链接"
            active={editor.isActive('link')}
            onClick={setLink}
          />
          <ToolbarButton
            label={imageUploading ? '传' : '图'}
            title="上传图片"
            disabled={imageUploading}
            onClick={() => imageInputRef.current?.click()}
          />
          <ToolbarButton
            label="URL"
            title="插入网络图片"
            onClick={insertImageByUrl}
          />
          <ToolbarButton
            label="表"
            title="插入表格"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          />
          {editor.isActive('table') && (
            <>
              <ToolbarButton
                label="+行"
                title="增加行"
                onClick={() => editor.chain().focus().addRowAfter().run()}
              />
              <ToolbarButton
                label="+列"
                title="增加列"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              />
              <ToolbarButton
                label="删表"
                title="删除表格"
                onClick={() => editor.chain().focus().deleteTable().run()}
              />
            </>
          )}
          <ToolbarDivider />
          <ToolbarButton
            label="↶"
            title="撤销"
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            label="↷"
            title="重做"
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
          />
          <ToolbarButton
            label="清"
            title="清除格式"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
          />
        </div>
        <EditorContent editor={editor} className="rich-editor-content" />
      </div>
    </div>
  );
}
