import React, { useState, useEffect } from 'react';

const AdminNewsEditor = ({ newsId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: '行业资讯',
        meta_keywords: '',
        meta_description: ''
    });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (newsId) {
            // Fetch existing news for editing (not implemented yet, but we'll fetch from the list in AdminPage)
        }
    }, [newsId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Auto-generate slug from title if it's empty
        if (name === 'title' && !formData.slug) {
            const autoSlug = value.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug: autoSlug }));
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const token = localStorage.getItem('admin_token');
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });
            const result = await response.json();
            if (result.success) {
                setFormData(prev => ({ ...prev, cover_image: result.url }));
            } else {
                alert('上传失败: ' + result.message);
            }
        } catch (err) {
            alert('上传出错');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('admin_token');
        const method = newsId ? 'PUT' : 'POST';
        const url = newsId ? `/api/admin/news?id=${newsId}` : '/api/admin/news';

        try {
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.success) {
                onSave();
            } else {
                alert('保存失败: ' + result.message);
            }
        } catch (err) {
            alert('服务器错误');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-editor-card">
            <div className="editor-header">
                <h3>{newsId ? '修改新闻' : '发布新文章'}</h3>
                <button className="close-btn" onClick={onCancel}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="editor-form">
                <div className="form-row">
                    <div className="form-group flex-2">
                        <label>文章标题</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="输入引人注目的标题" required />
                    </div>
                    <div className="form-group flex-1">
                        <label>SEO 路径 (Slug)</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. magnet-guide" required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-1">
                        <label>分类</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="行业资讯">行业资讯</option>
                            <option value="企业动态">企业动态</option>
                            <option value="技术方案">技术方案</option>
                            <option value="百科知识">百科知识</option>
                        </select>
                    </div>
                    <div className="form-group flex-2">
                        <label>封面图片 (R2 托管)</label>
                        <div className="upload-wrapper">
                            <input type="text" name="cover_image" value={formData.cover_image} onChange={handleChange} placeholder="上传或粘贴图片URL" />
                            <label className="upload-btn">
                                {uploading ? '上传中...' : '上传图片'}
                                <input type="file" accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>文章摘要 (用于卡片展示)</label>
                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="简单描述一下文章内容..." rows="2"></textarea>
                </div>

                <div className="form-group">
                    <label>详细正文 (支持 HTML)</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} placeholder="开始您的创作..." rows="12"></textarea>
                </div>

                <div className="seo-section">
                    <h4>SEO 搜索优化</h4>
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Meta 关键词</label>
                            <input type="text" name="meta_keywords" value={formData.meta_keywords} onChange={handleChange} placeholder="关键词1, 关键词2" />
                        </div>
                        <div className="form-group flex-1">
                            <label>Meta 描述</label>
                            <input type="text" name="meta_description" value={formData.meta_description} onChange={handleChange} placeholder="简洁的文章SEO描述" />
                        </div>
                    </div>
                </div>

                <div className="editor-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>取消</button>
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? '保存中...' : (newsId ? '更新文章' : '立即发布')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminNewsEditor;
