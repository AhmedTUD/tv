export const translations = {
  ar: {
    // Navbar
    appName: "TV Compare",
    appSubtitle: "Pro",
    adminPanel: "لوحة التحكم",
    
    // Hero
    heroTitle: "مقارنة التلفزيونات",
    heroSubtitle: "أفضل تلفزيون",
    heroDescription: "",
    searchPlaceholder: "ابحث عن موديل (مثلاً: Samsung S95F)...",
    
    // Buttons
    addToCompare: "إضافة للمقارنة",
    removeFromCompare: "إزالة من المقارنة",
    compare: "مقارنة",
    clear: "مسح",
    showAllModels: "عرض كل الموديلات",
    
    // Messages
    maxModelsReached: "يمكنك مقارنة 4 موديلات كحد أقصى.",
    noModelsFound: "لا توجد موديلات تطابق بحثك.",
    modelsSelected: "تم اختيار",
    models: "موديلات",
    loading: "جاري تحميل البيانات...",
    dataUpdated: "تم تحديث البيانات بنجاح!",
  },
  
  en: {
    // Navbar
    appName: "TV Compare",
    appSubtitle: "Pro",
    adminPanel: "Admin Panel",
    
    // Hero
    heroTitle: "TV Comparison",
    heroSubtitle: "The Best TV",
    heroDescription: "",
    searchPlaceholder: "Search for a model (e.g., Samsung S95F)...",
    
    // Buttons
    addToCompare: "Add to Compare",
    removeFromCompare: "Remove from Compare",
    compare: "Compare",
    clear: "Clear",
    showAllModels: "Show All Models",
    
    // Messages
    maxModelsReached: "You can compare up to 4 models.",
    noModelsFound: "No models match your search.",
    modelsSelected: "Selected",
    models: "models",
    loading: "Loading data...",
    dataUpdated: "Data updated successfully!",
  },
  
  fr: {
    // Navbar
    appName: "TV Compare",
    appSubtitle: "Pro",
    adminPanel: "Panneau d'administration",
    
    // Hero
    heroTitle: "Comparaison de téléviseurs",
    heroSubtitle: "Le meilleur téléviseur",
    heroDescription: "",
    searchPlaceholder: "Rechercher un modèle (ex: Samsung S95F)...",
    
    // Buttons
    addToCompare: "Ajouter à la comparaison",
    removeFromCompare: "Retirer de la comparaison",
    compare: "Comparer",
    clear: "Effacer",
    showAllModels: "Afficher tous les modèles",
    
    // Messages
    maxModelsReached: "Vous pouvez comparer jusqu'à 4 modèles.",
    noModelsFound: "Aucun modèle ne correspond à votre recherche.",
    modelsSelected: "Sélectionné",
    models: "modèles",
    loading: "Chargement des données...",
    dataUpdated: "Données mises à jour avec succès!",
  },
  
  es: {
    // Navbar
    appName: "TV Compare",
    appSubtitle: "Pro",
    adminPanel: "Panel de administración",
    
    // Hero
    heroTitle: "Comparación de televisores",
    heroSubtitle: "El mejor televisor",
    heroDescription: "",
    searchPlaceholder: "Buscar un modelo (ej: Samsung S95F)...",
    
    // Buttons
    addToCompare: "Añadir a comparar",
    removeFromCompare: "Quitar de comparar",
    compare: "Comparar",
    clear: "Limpiar",
    showAllModels: "Mostrar todos los modelos",
    
    // Messages
    maxModelsReached: "Puedes comparar hasta 4 modelos.",
    noModelsFound: "No hay modelos que coincidan con tu búsqueda.",
    modelsSelected: "Seleccionado",
    models: "modelos",
    loading: "Cargando datos...",
    dataUpdated: "¡Datos actualizados con éxito!",
  },
  
  de: {
    // Navbar
    appName: "TV Compare",
    appSubtitle: "Pro",
    adminPanel: "Verwaltungspanel",
    
    // Hero
    heroTitle: "TV-Vergleich",
    heroSubtitle: "Der beste Fernseher",
    heroDescription: "",
    searchPlaceholder: "Nach einem Modell suchen (z.B. Samsung S95F)...",
    
    // Buttons
    addToCompare: "Zum Vergleich hinzufügen",
    removeFromCompare: "Aus Vergleich entfernen",
    compare: "Vergleichen",
    clear: "Löschen",
    showAllModels: "Alle Modelle anzeigen",
    
    // Messages
    maxModelsReached: "Sie können bis zu 4 Modelle vergleichen.",
    noModelsFound: "Keine Modelle entsprechen Ihrer Suche.",
    modelsSelected: "Ausgewählt",
    models: "Modelle",
    loading: "Daten werden geladen...",
    dataUpdated: "Daten erfolgreich aktualisiert!",
  },
  
  zh: {
    // Navbar
    appName: "TV Compare",
    appSubtitle: "Pro",
    adminPanel: "管理面板",
    
    // Hero
    heroTitle: "电视比较",
    heroSubtitle: "最佳电视",
    heroDescription: "",
    searchPlaceholder: "搜索型号（例如：Samsung S95F）...",
    
    // Buttons
    addToCompare: "添加到比较",
    removeFromCompare: "从比较中移除",
    compare: "比较",
    clear: "清除",
    showAllModels: "显示所有型号",
    
    // Messages
    maxModelsReached: "您最多可以比较4个型号。",
    noModelsFound: "没有找到匹配的型号。",
    modelsSelected: "已选择",
    models: "型号",
    loading: "正在加载数据...",
    dataUpdated: "数据更新成功！",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ar;

export const languages: { code: Language; name: string; flag: string; rtl: boolean }[] = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'en', name: 'English', flag: '🇬🇧', rtl: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false },
];
