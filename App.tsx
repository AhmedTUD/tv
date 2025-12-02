import React, { useState, useEffect } from 'react';
import { ComparisonField, TVModel, ViewMode } from './types';
import { ComparisonView } from './components/ComparisonView';
import { AdminPanel } from './components/AdminPanel';
import { ShieldCheck, Scale, Plus, Trash, Tv, Search, Cloud, RefreshCw } from 'lucide-react';
import { ZoomableImage } from './components/ImageLightbox';
import { db } from './services/db';

export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [fields, setFields] = useState<ComparisonField[]>([]);
  const [models, setModels] = useState<TVModel[]>([]);

  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      // 1. Try to pull latest from cloud if connected
      if (db.getIsConnected()) {
        await db.pullFromCloud();
      }

      // 2. Load whatever is in local storage (now updated)
      setFields(db.getFields());
      setModels(db.getModels());
      
      setIsLoading(false);
    };

    initData();
  }, []);

  // Wrappers to update state AND database
  const handleUpdateFields = (newFields: ComparisonField[]) => {
    setFields(newFields);
    db.saveFields(newFields);
  };

  const handleUpdateModels = (newModels: TVModel[]) => {
    setModels(newModels);
    db.saveModels(newModels);
  };

  const handleRestoreComplete = () => {
    setFields(db.getFields());
    setModels(db.getModels());
    alert("تم تحديث البيانات بنجاح!");
  };

  const toggleModelSelection = (id: string) => {
    if (selectedModelIds.includes(id)) {
      setSelectedModelIds(prev => prev.filter(mid => mid !== id));
    } else {
      if (selectedModelIds.length >= 4) {
        alert("يمكنك مقارنة 4 موديلات كحد أقصى.");
        return;
      }
      setSelectedModelIds(prev => [...prev, id]);
    }
  };

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedModelsData = models.filter(m => selectedModelIds.includes(m.id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Tv className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-slate-800 leading-none">
                TV Compare
              </span>
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${view === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">لوحة التحكم</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-8 px-4 relative overflow-hidden">
        {/* Background blobs */}
        {view === 'home' && (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float pointer-events-none" />
            <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-1000 pointer-events-none" />
          </>
        )}

        {view === 'admin' ? (
          <AdminPanel 
            fields={fields} 
            models={models} 
            onUpdateFields={handleUpdateFields} 
            onUpdateModels={handleUpdateModels} 
            onDataImported={handleRestoreComplete}
          />
        ) : view === 'compare' ? (
          <ComparisonView 
            models={selectedModelsData} 
            fields={fields} 
            onBack={() => setView('home')} 
            onRemoveModel={(id) => toggleModelSelection(id)}
          />
        ) : (
          <div className="max-w-7xl mx-auto relative z-10 pb-32">
            {/* Hero / Search */}
            <div className="text-center mb-16 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                tv comparison<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">The Best TV</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto px-4 font-medium">
              
              </p>
              
              <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-white rounded-full shadow-xl flex items-center p-2 border border-slate-100">
                  <Search className="w-6 h-6 text-slate-400 mr-3 ml-2" />
                  <input 
                    type="text" 
                    placeholder="ابحث عن موديل (مثلاً: Samsung S95F)..." 
                    className="flex-1 p-3 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-lg h-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                     <button onClick={() => setSearchTerm('')} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredModels.map((model, index) => {
                const isSelected = selectedModelIds.includes(model.id);
                return (
                  <div 
                    key={model.id} 
                    className={`group bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full animate-fade-in-up ${isSelected ? 'ring-2 ring-blue-500 shadow-blue-200' : 'shadow-sm border border-slate-100'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 aspect-[5/4] flex items-center justify-center p-6 overflow-hidden">
                      <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-105">
                         <ZoomableImage src={model.images[0]} alt={model.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white">
                        {model.brand}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1 relative">
                      <h3 className="font-bold text-xl text-slate-900 line-clamp-2 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {model.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(model.specs).slice(0, 2).map(([key, val]) => (
                          <span key={key} className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            {String(val)}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <button 
                          onClick={() => toggleModelSelection(model.id)}
                          className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isSelected ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30'}`}
                        >
                          {isSelected ? (
                            <>
                              <Trash className="w-4 h-4" /> إزالة من المقارنة
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> إضافة للمقارنة
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredModels.length === 0 && (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg">لا توجد موديلات تطابق بحثك.</p>
                <button onClick={() => setSearchTerm('')} className="text-blue-600 font-bold mt-2 hover:underline">عرض كل الموديلات</button>
              </div>
            )}
          </div>
        )}

        {/* Floating Comparison Bar */}
        {selectedModelIds.length > 0 && view !== 'compare' && (
          <div className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center px-4 animate-slide-up">
            <div className="glass-dark bg-slate-900/90 backdrop-blur-xl text-white p-3 pr-5 pl-3 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-black/5 flex items-center justify-between gap-6 max-w-2xl w-full">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3 space-x-reverse">
                  {selectedModelsData.map(m => (
                    <img 
                      key={m.id} 
                      src={m.images[0]} 
                      className="w-12 h-12 rounded-full border-2 border-slate-800 bg-white object-contain animate-slide-in-right" 
                      alt={m.name} 
                    />
                  ))}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-medium text-slate-400">تم اختيار</div>
                  <div className="text-base font-bold text-white">{selectedModelIds.length} موديلات</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedModelIds([])}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition font-medium text-sm"
                >
                  مسح
                </button>
                <button 
                  onClick={() => {
                    if(selectedModelIds.length < 2) return;
                    setView('compare');
                  }}
                  disabled={selectedModelIds.length < 2}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 transform active:scale-95 shadow-lg ${
                    selectedModelIds.length < 2 
                    ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50 text-white'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  مقارنة
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}