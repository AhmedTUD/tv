import React, { useState, useEffect } from 'react';
import { ComparisonField, TVModel } from '../types';
import { Check, X, Star, Zap, Award, ArrowRight, Table2, List, Sparkles } from 'lucide-react';
import { ZoomableImage } from './ImageLightbox';

interface ComparisonViewProps {
  models: TVModel[];
  fields: ComparisonField[];
  onBack: () => void;
  onRemoveModel: (id: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  models,
  fields,
  onBack,
  onRemoveModel
}) => {
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

  // Set default layout based on screen size
  useEffect(() => {
    if (window.innerWidth < 768) {
      setLayout('vertical');
    }
  }, []);

  // --- Logic Helpers ---

  const getBestModelIdForField = (field: ComparisonField): string | null => {
    if (field.comparison_rule === 'none' || field.comparison_rule === 'equal' || models.length < 2) return null;

    let bestId: string | null = null;
    let bestValue: any = null;

    models.forEach(model => {
      const val = model.specs[field.id];
      if (val === undefined || val === null) return;

      if (bestValue === null) {
        bestValue = val;
        bestId = model.id;
        return;
      }

      if (field.comparison_rule === 'higher_is_better') {
        if (typeof val === 'number' && val > bestValue) {
          bestValue = val;
          bestId = model.id;
        }
      } else if (field.comparison_rule === 'lower_is_better') {
        if (typeof val === 'number' && val < bestValue) {
          bestValue = val;
          bestId = model.id;
        }
      }
    });

    return bestId;
  };

  const isDifferent = (fieldId: string): boolean => {
    if (models.length < 2) return false;
    const firstVal = models[0].specs[fieldId];
    return models.some(m => m.specs[fieldId] !== firstVal);
  };

  const renderValue = (val: any, field: ComparisonField) => {
    if (val === undefined || val === null) return <span className="text-gray-300">-</span>;
    if (field.type === 'boolean') {
      return val ? 
        <div className="flex justify-center"><div className="bg-green-100 p-1.5 rounded-full"><Check className="w-5 h-5 text-green-600" /></div></div> : 
        <div className="flex justify-center"><div className="bg-red-50 p-1.5 rounded-full"><X className="w-5 h-5 text-red-400" /></div></div>;
    }
    return (
      <span className="font-semibold text-slate-800">
        {val} <span className="text-xs text-slate-500 font-normal">{field.unit}</span>
      </span>
    );
  };

  // --- Renderers ---

  return (
    <div className="animate-fade-in-up p-2 md:p-6 max-w-[1400px] mx-auto pb-20">
      {/* Tools & Back Header - NOT Sticky anymore to save space */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
        <button onClick={onBack} className="group flex items-center text-slate-600 hover:text-blue-600 transition font-bold px-2">
          <div className="bg-white p-2 rounded-full ml-3 shadow-sm group-hover:bg-blue-100 transition-colors">
            <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </div>
          العودة للقائمة الرئيسية
        </button>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setLayout(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-blue-300 transition-all text-sm w-full sm:w-auto font-medium"
          >
            {layout === 'horizontal' ? <List className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
            {layout === 'horizontal' ? 'عرض بطاقات (موبايل)' : 'عرض جدول كامل'}
          </button>
        </div>
      </div>

      {/* Main Comparison Layout */}
      <div className={`transition-all duration-500 ${layout === 'horizontal' ? 'bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-slate-100' : 'flex flex-col md:flex-row gap-6'}`}>
        
        {layout === 'horizontal' ? (
          <div className="overflow-x-auto relative">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr>
                  {/* Top-Right Corner (Specs Label) - Sticky both ways */}
                  <th className="p-4 w-48 md:w-64 bg-slate-50/95 backdrop-blur text-right sticky top-[80px] right-0 z-40 border-b border-slate-200 shadow-[2px_2px_10px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      المواصفات
                    </div>
                  </th>
                  
                  {/* Model Headers - Sticky Top */}
                  {models.map(model => (
                    <th key={model.id} className="p-4 w-56 md:w-72 border-b border-l border-slate-100 align-top bg-white/95 backdrop-blur-sm sticky top-[80px] z-30 group transition-colors hover:bg-slate-50">
                      <button 
                        onClick={() => onRemoveModel(model.id)}
                        className="absolute top-2 left-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 transform hover:scale-110"
                        title="إزالة من المقارنة"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="flex flex-col items-center gap-4 pt-2">
                        <div className="w-32 h-24 md:w-40 md:h-28 relative">
                           <ZoomableImage src={model.images[0]} alt={model.name} className="w-full h-full rounded-lg mix-blend-multiply" />
                        </div>
                        <div className="text-center w-full px-2">
                          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold mb-2 tracking-wide border border-blue-100">
                            {model.brand}
                          </div>
                          <h3 className="text-sm md:text-base font-bold leading-snug text-slate-800 line-clamp-2 h-10 flex items-center justify-center">
                            {model.name}
                          </h3>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map(field => {
                  const bestId = getBestModelIdForField(field);
                  const isDiff = isDifferent(field.id);
                  
                  return (
                    <tr key={field.id} className={`comparison-row group transition-all duration-200 ${isDiff ? 'bg-amber-50/30' : 'bg-white'}`}>
                      {/* Field Label - Sticky Right */}
                      <td className="p-4 text-right font-medium text-slate-600 bg-white/95 backdrop-blur sticky right-0 z-20 flex items-center gap-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-l border-slate-100 h-full">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${field.is_highlightable ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                           {field.highlight_icon === 'zap' ? <Zap className="w-4 h-4" /> : field.is_highlightable ? <Star className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                         </div>
                         <span className="truncate text-sm group-hover:text-blue-700 transition-colors w-full">{field.label}</span>
                      </td>
                      
                      {/* Data Cells */}
                      {models.map(model => {
                        const isBest = bestId === model.id;
                        return (
                          <td key={`${model.id}-${field.id}`} className={`p-4 text-center border-l border-slate-50 relative transition-colors duration-300 ${isBest ? 'bg-emerald-50/40' : 'group-hover:bg-slate-50/50'}`}>
                            {isBest && (
                              <div className="absolute top-1 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold shadow-sm">
                                  <Award className="w-3 h-3" /> الأفضل
                                </span>
                              </div>
                            )}
                            <div className={`relative z-0 ${isBest ? 'font-bold text-slate-900' : ''}`}>
                              {renderValue(model.specs[field.id], field)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Vertical Stacked Card View (Mobile Optimized) */
          <div className="flex flex-col gap-6">
             {models.map((model, idx) => (
            <div 
              key={model.id} 
              className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex-1 animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
               <div className="p-6 border-b border-slate-100 flex flex-col items-center relative bg-gradient-to-b from-slate-50 to-white">
                 <button onClick={() => onRemoveModel(model.id)} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-slate-300 hover:text-red-500 transition-colors border border-slate-100 z-10"><X className="w-4 h-4"/></button>
                 
                 <div className="w-full h-40 mb-4 relative flex items-center justify-center">
                    <ZoomableImage src={model.images[0]} alt={model.name} className="max-w-full max-h-full rounded-lg mix-blend-multiply" />
                 </div>

                 <div className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-1">{model.brand}</div>
                 <h3 className="font-black text-xl text-center leading-tight text-slate-800 mb-2">{model.name}</h3>
               </div>
               
               <div className="divide-y divide-slate-50">
                 {fields.map(field => {
                    const isBest = getBestModelIdForField(field) === model.id;
                    const isDiff = isDifferent(field.id);
                    return (
                      <div key={field.id} className={`p-4 flex justify-between items-center transition-colors ${isDiff ? 'bg-amber-50/30' : ''} ${isBest ? 'bg-emerald-50/30' : ''}`}>
                        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                          {field.is_highlightable ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <div className="w-3.5" />}
                          {field.label}
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                          {isBest && <Award className="w-4 h-4 text-emerald-500 fill-emerald-100" />}
                          <div className={`text-right text-sm md:text-base ${isBest ? 'font-bold text-emerald-800' : 'text-slate-800'}`}>
                            {renderValue(model.specs[field.id], field)}
                          </div>
                        </div>
                      </div>
                    )
                 })}
               </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};