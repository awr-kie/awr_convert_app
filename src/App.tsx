import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import { User, UserRole } from './types';
import { cn } from './utils';
import { Language, TRANSLATIONS } from './translations';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';

// --- Components ---

const Clock = ({ lang }: { lang: Language }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const locale = 'uk-UA';

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-slate-900 font-black text-lg leading-none tracking-tighter">
        {time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {time.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
};

const Logo = ({ size = "md", light = false, lang }: { size?: "sm" | "md" | "lg", light?: boolean, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-24 h-24 text-4xl"
  };
  
  return (
    <div className={cn(
      "relative flex items-center justify-center font-black tracking-tighter rounded-[30%] transition-all hover:rotate-3 group",
      sizes[size],
      light ? "bg-white text-primary" : "voda-gradient text-white shadow-xl shadow-primary/20"
    )}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[30%]"></div>
      <span className="relative z-10">{t.appName}</span>
      {size === "lg" && (
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-4 border-2 border-primary/10 rounded-[35%]"
        />
      )}
    </div>
  );
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  lang 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title?: string, 
  message?: string,
  lang: Language 
}) => {
  const t = TRANSLATIONS[lang];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-primary" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          {title || t.confirmAction}
        </h3>
        <p className="text-sm text-slate-500 font-bold mb-8">
          {message || t.confirmMessage}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
          >
            {t.cancel}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            {t.confirm}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Toast = ({ 
  message, 
  isVisible, 
  onClose 
}: { 
  message: string, 
  isVisible: boolean, 
  onClose: () => void 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-[10000] px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-4"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <CheckCircle size={18} className="text-white" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Utils ---

const parseDate = (dateStr: string) => {
  if (!dateStr) return 0;
  
  const s = dateStr.trim();
  
  const dmyMatch = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const month = parseInt(dmyMatch[2]) - 1;
    let year = parseInt(dmyMatch[3]);
    if (year < 100) year += 2000;
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4]) : 0;
    const min = dmyMatch[5] ? parseInt(dmyMatch[5]) : 0;
    const sec = dmyMatch[6] ? parseInt(dmyMatch[6]) : 0;
    return new Date(year, month, day, hour, min, sec).getTime();
  }

  const ymdMatch = s.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (ymdMatch) {
    return new Date(parseInt(ymdMatch[1]), parseInt(ymdMatch[2]) - 1, parseInt(ymdMatch[3])).getTime();
  }
  
  const d = new Date(s);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const parseCSV = (text: string) => {
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '"') inQuotes = !inQuotes;
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
      if (char === '\r' && cleanText[i + 1] === '\n') i++;
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return { headers: [], rows: [] };
  
  const firstLine = lines[0];
  const separators = [';', ',', '\t'];
  let separator = ';';
  let maxCols = 0;

  separators.forEach(s => {
    const cols = firstLine.split(s).length;
    if (cols > maxCols) {
      maxCols = cols;
      separator = s;
    }
  });
  
  const splitLine = (line: string) => {
    const result = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQ = !inQ;
      else if (c === separator && !inQ) {
        result.push(cur.trim().replace(/^"|"$/g, '').trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, '').trim());
    return result;
  };

  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = splitLine(line);
    const row: any = {};
    headers.forEach((header, index) => {
      if (header) {
        row[header] = values[index] || '';
      }
    });
    return row;
  });
  
  return { headers, rows };
};

const parseJSON = (text: string) => {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      return { headers, rows: data };
    }
  } catch (e) {
    console.error("JSON parse error", e);
  }
  return { headers: [], rows: [] };
};

const escapeCSV = (val: string) => {
  if (val === null || val === undefined) return "";
  const stringVal = String(val);
  if (stringVal.includes(';') || stringVal.includes('"') || stringVal.includes('\n')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
};

// --- Main App ---

const LoadingScreen = ({ lang }: { lang: Language, key?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <Logo size="lg" lang={lang} />
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-[18px] font-black text-slate-900 lowercase tracking-widest"
        >
          assistant work resource
        </motion.p>

        <div className="w-48 h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            className="h-full bg-primary"
          />
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] whitespace-nowrap"
        >
          Завантаження системи
        </motion.p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const lang = Language.UK;
  const t = TRANSLATIONS[lang];
  const { isTelegram, userData } = useTelegramWebApp();
  
  // Используем данные из Telegram если доступны
  const user: User = { 
    id: userData?.id?.toString() || '1', 
    username: userData?.username || userData?.first_name || 'admin', 
    role: UserRole.ADMIN 
  };

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'converter'>('converter');
  const [converterStep, setConverterStep] = useState<'idle' | 'ready'>('idle');
  const [convertedData, setConvertedData] = useState<{ headers: string[], rows: any[] }>({ headers: [], rows: [] });
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const converterInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    title?: string;
    message?: string;
  }>({ isOpen: false, onConfirm: () => {} });

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
  }>({ isVisible: false, message: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const MAPPING_CONFIG = [
    { target: "Дата", sources: ["Дата фактического включения", "Дата вкл", "Дата"] },
    { target: "№ наряда", sources: ["№ наряда", "Наряд", "Номер наряда"] },
    { target: "Город", sources: ["Нас. пункт", "Населенный пункт", "Город", "Пункт"] },
    { target: "Улица, дом", sources: ["Адрес подключения", "Адрес", "Улица"] },
    { target: "Кв.", sources: ["Расположение", "Квартира", "Кв"] },
    { target: "Исполнитель", sources: [] },
    { target: "Типа наряда", sources: [] },
    { target: "Тип услуги", sources: ["Сервиси", "Сервисы", "Услуга"] },
    { target: "включая технологии", sources: ["Тип последней мили", "Технология", "Миля"] },
    { target: "Категория", sources: [] },
    { target: "Обстеження", sources: [] },
    { target: "Дод.Виїзд", sources: [] },
    { target: "Пристрої", sources: ["Оборудование абонента", "Оборудование", "Пристрої"] },
    { target: "Юр. чи физ. человек", sources: ["Тип абонента", "Абонент"] },
    { target: "Дополнительный сервис", sources: [] },
    { target: "Комментарий", sources: ["Бригада (Наименование)", "Бригада", "Комментарий"] }
  ];

  const getMappedValue = (row: any, targetLabel: string) => {
    const mapping = MAPPING_CONFIG.find(m => m.target === targetLabel);
    if (!mapping) return "";
    
    for (const sourceKey of mapping.sources) {
      const foundKey = Object.keys(row).find(k => {
        const cleanK = k.toLowerCase().trim();
        const cleanS = sourceKey.toLowerCase().trim();
        return cleanK === cleanS || cleanK.includes(cleanS);
      });
      if (foundKey && row[foundKey]) {
        let val = String(row[foundKey]);
        if (targetLabel === "Дата" && val.startsWith('=')) {
          val = val.substring(1);
        }
        return val;
      }
    }
    return "";
  };

  const handleConverterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
            let parsedData = { headers: [], rows: [] };
            
            if (file.name.endsWith('.csv')) {
                parsedData = parseCSV(content); 
            } else if (file.name.endsWith('.json')) {
                parsedData = parseJSON(content);
            }
            
            const sortedRows = [...parsedData.rows].sort((a, b) => {
              const dateA = parseDate(getMappedValue(a, "Дата"));
              const dateB = parseDate(getMappedValue(b, "Дата"));
              return dateA - dateB;
            });
            
            setConvertedData({ headers: parsedData.headers, rows: sortedRows });
            setPreviewRows(sortedRows.slice(0, 3));
            setConverterStep('ready');
            setToast({ isVisible: true, message: 'Файл успішно оброблено' });
        }
    };
    
    reader.readAsText(file); 
    e.target.value = '';
  };

  const handleConverterDownload = () => {
    if (convertedData.rows.length === 0) return;
    
    const csvRows = []; 
    const separator = ';'; 
    
    csvRows.push(MAPPING_CONFIG.map(m => escapeCSV(m.target)).join(separator));
    
    convertedData.rows.forEach(row => {
      const rowValues = MAPPING_CONFIG.map(m => escapeCSV(getMappedValue(row, m.target)));
      csvRows.push(rowValues.join(separator));
    });
    
    const bom = '\uFEFF'; 
    const blob = new Blob([bom + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a'); 
    link.href = url; 
    link.setAttribute('download', 'awr_convert.csv'); 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
    setToast({ isVisible: true, message: 'Файл завантажено' });
  };

  return (
    <div className="bg-bg min-h-screen">
      <AnimatePresence>
        {isLoading && <LoadingScreen lang={lang} key="loading" />}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        lang={lang}
      />

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="app-container">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Left Section */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-[100px] sm:min-w-[180px]">
            <div className="flex items-center gap-3">
              <Logo size="sm" lang={lang} />
              <h1 className="font-black text-slate-900 tracking-tighter text-sm hidden lg:block">connect_kie</h1>
            </div>
          </div>

          {/* Center Section: Date and Time */}
          <div className="flex-1 flex justify-center scale-90 sm:scale-95">
            <Clock lang={lang} />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-[100px] sm:min-w-[180px] justify-end">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5 uppercase tracking-widest">{user.username}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  {t.admin}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-slate-900/20">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {viewMode === 'converter' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] max-w-xl mx-auto animate-fade-in">
              <input ref={converterInputRef} type="file" hidden accept=".csv,.json" onChange={handleConverterUpload} />
              
              <div className="w-full bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
                {converterStep === 'idle' ? ( 
                  <>
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                      <FileText size={40} className="text-slate-900" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{t.convTitle}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">{t.convUploadHint}</p>
                    
                    <button 
                      onClick={() => converterInputRef.current?.click()} 
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                      {t.btnUpload}
                    </button>
                  </> 
                ) : ( 
                  <>
                    <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                      <CheckCircle size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{t.convReady}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">Файл успішно оброблено та відсортовано за датою</p>

                    <button 
                      onClick={handleConverterDownload} 
                      className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <Download size={18} />
                      {t.convDownload}
                    </button>
                    <button 
                      onClick={() => setConverterStep('idle')} 
                      className="mt-8 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      {t.convBack}
                    </button>
                  </> 
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}