import React, { useState, useEffect } from 'react';
import { ComparisonField, TVModel, FieldType, ComparisonRule } from '../types';
import { Plus, Trash2, Edit2, Save, X, GripVertical, CheckCircle, Lock, Key, LogOut, Settings, ShieldAlert, Image as ImageIcon, Link as LinkIcon, Upload, Download, Cloud, Database } from 'lucide-react';
import { db } from '../services/db';

interface AdminPanelProps {
  fields: ComparisonField[];
  models: TVModel[];
  onUpdateFields: (fields: ComparisonField[]) => void;
  onUpdateModels: (models: TVModel[]) => void;
  onDataImported: () => void;
}

const DEFAULT_PASSWORD = 'admin';
const STORAGE_KEY_PWD = 'tv_compare_admin_pwd';
const STORAGE_KEY_SESSION = 'tv_compare_admin_session';

export const AdminPanel: React.FC<AdminPanelProps> = ({ fields, models, onUpdateFields, onUpdateModels, onDataImported }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Main Admin State
  const [activeTab, setActiveTab] = useState<'models' | 'fields' | 'settings'>('models');
  const [editingField, setEditingField] = useState<Partial<ComparisonField> | null>(null);
  const [editingModel, setEditingModel] = useState<Partial<TVModel> | null>(null);
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');

  // Database Connection State
  const [dbConfig, setDbConfig] = useState({ url: '', key: '' });
  const [isConnected, setIsConnected] = useState(false);

  // Change Password State
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const isLogged = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (isLogged === 'true') {
      setIsAuthenticated(true);
    }
    setIsConnected(db.getIsConnected());
  }, []);

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = localStorage.getItem(STORAGE_KEY_PWD) || DEFAULT_PASSWORD;
    
    if (passwordInput === storedPwd) {
      setIsAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    setActiveTab('models');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPwd = localStorage.getItem(STORAGE_KEY_PWD) || DEFAULT_PASSWORD;

    if (pwdForm.current !== storedPwd) {
      setPwdMsg({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }
    if (pwdForm.new.length < 4) {
      setPwdMsg({ type: 'error', text: 'كلمة المرور الجديدة قصيرة جداً' });
      return;
    }
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdMsg({ type: 'error', text: 'كلمة المرور الجديدة غير متطابقة' });
      return;
    }

    localStorage.setItem(STORAGE_KEY_PWD, pwdForm.new);
    setPwdMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
    setPwdForm({ current: '', new: '', confirm: '' });
  };

  // --- DB Connection Handler ---
  const handleConnectDb = () => {
    if (!dbConfig.url || !dbConfig.key) {
      alert("الرجاء إدخال البيانات المطلوبة");
      return;
    }
    
    if (!dbConfig.url.startsWith('http')) {
      alert("خطأ: رابط المشروع يجب أن يبدأ بـ https://");
      return;
    }

    db.saveConfig(dbConfig.url, dbConfig.key);
    
    const connected = db.getIsConnected();
    setIsConnected(connected);
    
    if (connected) {
      alert("تم حفظ إعدادات الاتصال بنجاح. سيتم مزامنة البيانات تلقائياً.");
      onDataImported(); // Trigger a reload/sync
    } else {
      alert("فشل الاتصال. تأكد من صحة الرابط والمفتاح.");
    }
  };

  const handleDisconnectDb = () => {
    if (confirm("هل أنت متأكد من قطع الاتصال؟")) {
      db.disconnect();
      setIsConnected(false);
      setDbConfig({ url: '', key: '' });
    }
  };

  // --- Handlers for Fields ---
  const handleFieldLabelChange = (val: string) => {
    if (editingField) {
      const updates: Partial<ComparisonField> = { label: val };
      // Auto-generate ID from Arabic label if ID is empty
      if (!editingField.id) {
         // Simple transliteration map could be added here, but for now random is safer for collision
         updates.id = 'f_' + Math.random().toString(36).substr(2, 6);
      }
      setEditingField({ ...editingField, ...updates });
    }
  };

  const saveField = async () => {
    if (!editingField || !editingField.label || !editingField.id) return;
    
    const newField: ComparisonField = {
      id: editingField.id,
      label: editingField.label,
      type: editingField.type || 'text',
      unit: editingField.unit || '',
      order: editingField.order || fields.length + 1,
      is_highlightable: editingField.is_highlightable || false,
      comparison_rule: editingField.comparison_rule || 'none',
      options: editingField.options,
      highlight_color: editingField.highlight_color,
    };

    let updatedFields;
    const exists = fields.find(f => f.id === newField.id);
    if (exists) {
      updatedFields = fields.map(f => f.id === newField.id ? newField : f);
    } else {
      updatedFields = [...fields, newField];
    }
    
    onUpdateFields(updatedFields); 
    setEditingField(null);
  };

  const deleteField = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحقل؟")) {
      const updated = fields.filter(f => f.id !== id);
      onUpdateFields(updated);
    }
  };

  // --- Handlers for Models ---
  const saveModel = () => {
    if (!editingModel || !editingModel.name) return;

    const newModel: TVModel = {
      id: editingModel.id || Math.random().toString(36).substr(2, 9),
      brand: editingModel.brand || 'Unknown',
      name: editingModel.name,
      slug: editingModel.slug || editingModel.name.toLowerCase().replace(/\s/g, '-'),
      images: editingModel.images || ['https://picsum.photos/400/300'],
      specs: editingModel.specs || {}
    };

    let updatedModels;
    const exists = models.find(m => m.id === newModel.id);
    if (exists) {
      updatedModels = models.map(m => m.id === newModel.id ? newModel : m);
    } else {
      updatedModels = [...models, newModel];
    }
    
    onUpdateModels(updatedModels);
    setEditingModel(null);
    setImageInputType('url');
  };

  const deleteModel = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الموديل؟")) {
      const updated = models.filter(m => m.id !== id);
      onUpdateModels(updated);
    }
  };

  const updateModelSpec = (fieldId: string, value: any) => {
    if (!editingModel) return;
    setEditingModel({
      ...editingModel,
      specs: {
        ...editingModel.specs,
        [fieldId]: value
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingModel) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingModel({ ...editingModel, images: [reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full text-center">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">تسجيل دخول المسؤول</h2>
          <p className="text-slate-500 mb-8">الرجاء إدخال كلمة المرور للوصول للوحة التحكم</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="كلمة المرور..."
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
            
            {loginError && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {loginError}
              </div>
            )}
            
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-200">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white min-h-[80vh] rounded-2xl shadow-sm border border-gray-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
        <div className="flex overflow-x-auto no-scrollbar gap-1">
          <button 
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm flex items-center gap-2 ${activeTab === 'models' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
             الموديلات ({models.length})
          </button>
          <button 
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm flex items-center gap-2 ${activeTab === 'fields' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
             الخصائص ({fields.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm flex items-center gap-2 ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
             <Settings className="w-4 h-4" /> الإعدادات وقاعدة البيانات
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition text-sm font-bold ml-auto md:ml-0"
        >
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </div>

      {/* --- MODELS TAB --- */}
      {activeTab === 'models' && (
        <div className="animate-fade-in-up">
          {!editingModel ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                 <h2 className="text-xl font-bold">قائمة الموديلات</h2>
                 <button onClick={() => setEditingModel({ specs: {} })} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto shadow-sm">
                    <Plus className="w-4 h-4"/> إضافة موديل جديد
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map(model => (
                  <div key={model.id} className="border p-4 rounded-xl flex gap-4 items-start group hover:border-blue-300 transition relative bg-gray-50/50 hover:bg-white hover:shadow-md">
                    <img src={model.images[0]} className="w-20 h-20 object-contain bg-white rounded-lg border flex-shrink-0 p-1" alt="" />
                    <div className="min-w-0">
                      <div className="text-xs text-blue-600 font-bold">{model.brand}</div>
                      <div className="font-bold text-gray-900 truncate">{model.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{Object.keys(model.specs).length} خاصية مسجلة</div>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => setEditingModel(model)} className="p-1.5 bg-white border rounded hover:text-blue-600 shadow-sm"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => deleteModel(model.id)} className="p-1.5 bg-white border rounded hover:text-red-600 shadow-sm"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <h3 className="text-lg font-bold">بيانات الموديل</h3>
                 <div className="flex gap-2">
                    <button onClick={() => setEditingModel(null)} className="px-3 md:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm md:text-base">إلغاء</button>
                    <button onClick={saveModel} className="px-4 md:px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 text-sm md:text-base"><Save className="w-4 h-4"/> حفظ</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700 border-b pb-2">معلومات أساسية</h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">اسم الموديل</label>
                    <input type="text" value={editingModel.name || ''} onChange={e => setEditingModel({...editingModel, name: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الماركة (Brand)</label>
                    <input type="text" value={editingModel.brand || ''} onChange={e => setEditingModel({...editingModel, brand: e.target.value})} className="w-full border p-2 rounded" />
                  </div>
                   
                   {/* Image Upload Toggle */}
                   <div>
                    <label className="block text-sm font-medium mb-2">صورة المنتج</label>
                    <div className="flex gap-2 mb-2 p-1 bg-gray-100 rounded-lg w-fit">
                      <button 
                        onClick={() => setImageInputType('url')}
                        className={`px-3 py-1 rounded-md text-sm transition flex items-center gap-1 ${imageInputType === 'url' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                      >
                        <LinkIcon className="w-3 h-3"/> رابط
                      </button>
                      <button 
                        onClick={() => setImageInputType('file')}
                         className={`px-3 py-1 rounded-md text-sm transition flex items-center gap-1 ${imageInputType === 'file' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                      >
                         <Upload className="w-3 h-3"/> رفع ملف
                      </button>
                    </div>

                    {imageInputType === 'url' ? (
                      <input 
                        type="text" 
                        placeholder="https://example.com/image.jpg"
                        value={editingModel.images?.[0] || ''} 
                        onChange={e => setEditingModel({...editingModel, images: [e.target.value]})} 
                        className="w-full border p-2 rounded font-mono text-xs text-gray-600" 
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={handleFileUpload}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                         <div className="flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">اضغط لرفع صورة من جهازك</span>
                         </div>
                      </div>
                    )}
                    
                    {editingModel.images?.[0] && (
                      <div className="mt-2 w-full h-32 bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                        <img src={editingModel.images[0]} className="max-h-full max-w-full object-contain" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700 border-b pb-2">الخصائص التقنية</h4>
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {fields.sort((a,b) => a.order - b.order).map(field => (
                      <div key={field.id} className="flex flex-col">
                         <label className="text-xs font-semibold text-gray-600 mb-1 flex justify-between">
                            {field.label} 
                            <span className="text-gray-400 font-normal">{field.unit}</span>
                         </label>
                         {field.type === 'boolean' ? (
                           <div className="flex gap-4">
                             <label className="flex items-center gap-2"><input type="radio" name={field.id} checked={editingModel.specs?.[field.id] === true} onChange={() => updateModelSpec(field.id, true)} /> نعم</label>
                             <label className="flex items-center gap-2"><input type="radio" name={field.id} checked={editingModel.specs?.[field.id] === false} onChange={() => updateModelSpec(field.id, false)} /> لا</label>
                           </div>
                         ) : field.type === 'select' && field.options ? (
                           <select 
                             value={editingModel.specs?.[field.id] || ''} 
                             onChange={e => updateModelSpec(field.id, e.target.value)}
                             className="border p-2 rounded text-sm bg-white"
                           >
                             <option value="">اختر...</option>
                             {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                         ) : (
                           <input 
                             type={field.type === 'number' ? 'number' : 'text'}
                             value={editingModel.specs?.[field.id] || ''} 
                             onChange={e => updateModelSpec(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                             className="border p-2 rounded text-sm"
                           />
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- FIELDS TAB --- */}
      {activeTab === 'fields' && (
         <div className="animate-fade-in-up">
            {!editingField ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                  <h2 className="text-xl font-bold">إدارة حقول المقارنة</h2>
                  <button onClick={() => setEditingField({})} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto shadow-sm">
                      <Plus className="w-4 h-4"/> إضافة حقل جديد
                  </button>
                </div>
                <div className="bg-white rounded-lg border overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-3 text-right">#</th>
                        <th className="p-3 text-right">الاسم</th>
                        <th className="p-3 text-right">النوع</th>
                        <th className="p-3 text-center">مميز؟</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fields.sort((a,b) => a.order - b.order).map(field => (
                        <tr key={field.id} className="hover:bg-gray-50 group">
                           <td className="p-3 w-12 text-center text-gray-400"><GripVertical className="w-4 h-4 mx-auto cursor-move"/></td>
                           <td className="p-3 font-medium">{field.label}</td>
                           <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{field.type}</span></td>
                           <td className="p-3 text-center">{field.is_highlightable ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto"/> : '-'}</td>
                           <td className="p-3 text-center">
                              <div className="flex justify-center gap-2 opacity-100 md:opacity-50 group-hover:opacity-100">
                                <button onClick={() => setEditingField(field)} className="text-blue-600"><Edit2 className="w-4 h-4"/></button>
                                <button onClick={() => deleteField(field.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto animate-fade-in">
                 <h3 className="text-lg font-bold mb-6">{editingField.id ? 'تعديل الحقل' : 'حقل جديد'}</h3>
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">اسم الخاصية (بالعربي)</label>
                      <input 
                        className="w-full border p-2 rounded" 
                        value={editingField.label || ''} 
                        onChange={e => handleFieldLabelChange(e.target.value)} 
                        placeholder="مثلاً: سطوع الشاشة"
                      />
                    </div>
                    
                    <div className="opacity-50">
                       <label className="block text-xs font-medium mb-1">المعرف البرمجي (تلقائي)</label>
                       <input className="w-full border p-2 rounded bg-gray-100 text-gray-500 font-mono text-xs" readOnly value={editingField.id || ''} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium mb-1">الوحدة (Unit)</label>
                         <input className="w-full border p-2 rounded" value={editingField.unit || ''} onChange={e => setEditingField({...editingField, unit: e.target.value})} placeholder="e.g. Hz, inch, nits" />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">نوع البيانات</label>
                         <select className="w-full border p-2 rounded bg-white" value={editingField.type || 'text'} onChange={e => setEditingField({...editingField, type: e.target.value as FieldType})}>
                           <option value="text">نص (Text)</option>
                           <option value="number">رقم (Number)</option>
                           <option value="boolean">نعم/لا (Boolean)</option>
                           <option value="select">قائمة (Select)</option>
                         </select>
                       </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">قاعدة التفضيل (من الأفضل؟)</label>
                        <select className="w-full border p-2 rounded bg-white" value={editingField.comparison_rule || 'none'} onChange={e => setEditingField({...editingField, comparison_rule: e.target.value as ComparisonRule})}>
                           <option value="none">لا توجد قاعدة (عرض فقط)</option>
                           <option value="higher_is_better">الرقم الأعلى هو الأفضل</option>
                           <option value="lower_is_better">الرقم الأقل هو الأفضل</option>
                           <option value="equal">المطابقة مطلوبة</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 border p-3 rounded bg-gray-50">
                       <input type="checkbox" id="is_high" checked={editingField.is_highlightable || false} onChange={e => setEditingField({...editingField, is_highlightable: e.target.checked})} />
                       <label htmlFor="is_high" className="text-sm select-none cursor-pointer">هل هذه خاصية مميزة (Featured)؟</label>
                    </div>

                    {editingField.type === 'select' && (
                       <div>
                         <label className="block text-sm font-medium mb-1">الخيارات (افصل بفاصلة)</label>
                         <input className="w-full border p-2 rounded" value={editingField.options?.join(',') || ''} onChange={e => setEditingField({...editingField, options: e.target.value.split(',').map(s => s.trim())})} placeholder="Option 1, Option 2" />
                       </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                       <button onClick={() => setEditingField(null)} className="px-4 py-2 rounded hover:bg-gray-100">إلغاء</button>
                       <button onClick={saveField} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">حفظ التغييرات</button>
                    </div>
                 </div>
              </div>
            )}
         </div>
      )}

      {/* --- SETTINGS & CLOUD TAB --- */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto py-8 animate-fade-in-up space-y-8">
           
           {/* Cloud Connection (Supabase) */}
           <div className={`bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden transition-all ${isConnected ? 'border-green-200 ring-4 ring-green-50' : 'border-slate-100'}`}>
               <div className={`absolute top-0 right-0 w-full h-1 ${isConnected ? 'bg-green-500' : 'bg-slate-300'}`}></div>
               
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <Cloud className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-slate-400'}`} /> 
                  {isConnected ? 'قاعدة البيانات السحابية (متصل)' : 'إعداد قاعدة البيانات السحابية'}
               </h3>

               {!isConnected ? (
                 <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <strong>كيفية تفعيل المزامنة الفورية:</strong><br/>
                      1. سجل حساب في <a href="https://supabase.com" target="_blank" className="text-blue-600 font-bold underline">Supabase.com</a> (مجاني).<br/>
                      2. أنشئ مشروع جديد (New Project).<br/>
                      3. انسخ الرابط (Project URL) والمفتاح (Anon Key) وضعهم هنا.<br/>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Project URL</label>
                        <input className="w-full border p-2 rounded bg-slate-50 font-mono text-sm" value={dbConfig.url} onChange={e => setDbConfig({...dbConfig, url: e.target.value})} placeholder="https://xyz.supabase.co" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">API Key (Anon/Public)</label>
                        <input className="w-full border p-2 rounded bg-slate-50 font-mono text-sm" type="password" value={dbConfig.key} onChange={e => setDbConfig({...dbConfig, key: e.target.value})} placeholder="eyJhbG..." />
                      </div>
                    </div>

                    <button onClick={handleConnectDb} className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition mt-2">
                       اتصال وحفظ الإعدادات
                    </button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                       <Database className="w-5 h-5"/>
                       <span className="font-bold text-sm">أنت متصل الآن بالسحابة! أي تغيير سيتم حفظه ومشاركته تلقائياً.</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-2 text-sm">خطوة واحدة أخيرة (مهم جداً):</h4>
                      <p className="text-sm text-slate-500 mb-2">اذهب إلى لوحة تحكم Supabase، ثم إلى <strong>SQL Editor</strong>، والصق الكود التالي واضغط Run:</p>
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs relative group">
                        <code>
                          create table if not exists app_data (
                            id int primary key,
                            payload jsonb
                          );
                          insert into app_data (id, payload) values (1, '&#123;&#125;') on conflict do nothing;
                        </code>
                      </div>
                    </div>

                    <button onClick={handleDisconnectDb} className="text-red-500 hover:text-red-700 text-sm font-bold underline">
                       قطع الاتصال (إيقاف المزامنة)
                    </button>
                 </div>
               )}
           </div>

           {/* Change Password */}
           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm opacity-80 hover:opacity-100 transition">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 border-b pb-4">
                <Settings className="w-5 h-5 text-gray-500" /> تغيير كلمة المرور
              </h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 text-slate-600">كلمة المرور الحالية</label>
                    <input type="password" required value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600">كلمة المرور الجديدة</label>
                        <input type="password" required value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600">تأكيد كلمة المرور</label>
                        <input type="password" required value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} className="w-full border p-2.5 rounded-lg outline-none" />
                    </div>
                 </div>

                 {pwdMsg.text && (
                   <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {pwdMsg.text}
                   </div>
                 )}

                 <button type="submit" className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition mt-2">
                    تحديث كلمة المرور
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};