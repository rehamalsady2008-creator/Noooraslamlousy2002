/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Plus, Trash2, Heart, Sparkles, Target, Award } from 'lucide-react';

interface TasbihSectionProps {
  soundEnabled: boolean;
  isEn?: boolean;
}

interface DailyHistory {
  [dateKey: string]: number;
}

const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Global AudioContext singleton to prevent stalling CPU/Audio thread on rapid taps
let globalAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

// Structured Tasbih Preset Categories
interface TasbihCategory {
  id: string;
  name: string;
  items: { text: string; target: number }[];
}

const TASBIH_CATEGORIES: TasbihCategory[] = [
  {
    id: 'salawat',
    name: '🌸 الصلاة على النبي ﷺ',
    items: [
      { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
      { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100 },
      { text: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', target: 100 },
      { text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ', target: 33 },
    ]
  },
  {
    id: 'baqiyat',
    name: '✨ الباقيات الصالحات',
    items: [
      { text: 'سُبْحَانَ اللَّهِ', target: 33 },
      { text: 'الْحَمْدُ لِلَّهِ', target: 33 },
      { text: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 33 },
      { text: 'اللَّهُ أَكْبَرُ', target: 33 },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 100 },
    ]
  },
  {
    id: 'istighfar',
    name: '🤍 الاستغفار والتوبة',
    items: [
      { text: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
      { text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ', target: 100 },
      { text: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', target: 100 },
      { text: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', target: 33 },
    ]
  },
  {
    id: 'hawqala',
    name: '🤲 الحوقلة والدعاء',
    items: [
      { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', target: 100 },
      { text: 'حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ', target: 100 },
      { text: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', target: 100 },
      { text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', target: 33 },
    ]
  },
  {
    id: 'tawhid',
    name: '👑 التوحيد والثناء',
    items: [
      { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', target: 100 },
      { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ', target: 3 },
      { text: 'الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ', target: 33 },
    ]
  }
];

export default function TasbihSection({ soundEnabled, isEn = false }: TasbihSectionProps) {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [selectedCategory, setSelectedCategory] = useState<string>('salawat');
  const [selectedPhrase, setSelectedPhrase] = useState<string>('اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ');
  const [customPhrase, setCustomPhrase] = useState<string>('');
  const [customPhrasesList, setCustomPhrasesList] = useState<string[]>([]);
  const [showCelebrate, setShowCelebrate] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(() => {
    return Number(localStorage.getItem('tasbih_total_count') || '0');
  });

  const [dailyHistory, setDailyHistory] = useState<DailyHistory>(() => {
    const stored = localStorage.getItem('tasbih_daily_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fail-safe
      }
    }
    const mock: DailyHistory = {};
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      mock[key] = i === 0 ? 0 : Math.floor(Math.random() * 100) + 33;
    }
    return mock;
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    return Number(localStorage.getItem('tasbih_daily_goal') || '100');
  });

  // Debounce saving state to localStorage to keep rapid tapping 100% lag-free
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVibrateRef = useRef<number>(0);

  const syncStorageDebounced = useCallback((newTotal: number, newHistory: DailyHistory) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('tasbih_total_count', newTotal.toString());
      localStorage.setItem('tasbih_daily_history', JSON.stringify(newHistory));
    }, 400);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasbih_daily_goal', dailyGoal.toString());
  }, [dailyGoal]);

  const todayKey = getTodayKey();
  const todayCount = dailyHistory[todayKey] || 0;
  const dailyProgressPercentage = Math.min((todayCount / dailyGoal) * 100, 100);

  // Ultra-lightweight click sound using shared AudioContext
  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {
      // Ignore audio glitches during rapid clicks
    }
  }, [soundEnabled]);

  const playCompleteSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.08);
        osc.stop(audioCtx.currentTime + index * 0.08 + 0.25);
      });
    } catch (e) {
      // Ignore
    }
  }, [soundEnabled]);

  // Ultra-fast instant increment handler
  const handleIncrement = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      // Prevent double firing on touch + click
      if (e.type === 'touchstart' || e.type === 'pointerdown') {
        if (e.cancelable) e.preventDefault();
      }
    }

    playClickSound();

    // Throttled haptic vibration to prevent hardware engine bottleneck on fast taps
    const now = Date.now();
    if (navigator.vibrate && now - lastVibrateRef.current > 35) {
      lastVibrateRef.current = now;
      try { navigator.vibrate(20); } catch (e) {}
    }

    setCount(prevCount => {
      const nextCount = prevCount + 1;
      if (nextCount === target) {
        playCompleteSound();
        setShowCelebrate(true);
        if (navigator.vibrate) {
          try { navigator.vibrate([80, 40, 80]); } catch (e) {}
        }
        setTimeout(() => setShowCelebrate(false), 2200);
      }
      return nextCount;
    });

    const key = getTodayKey();
    setTotalCount(prevTotal => {
      const newTotal = prevTotal + 1;
      setDailyHistory(prevHistory => {
        const newHistory = {
          ...prevHistory,
          [key]: (prevHistory[key] || 0) + 1
        };
        syncStorageDebounced(newTotal, newHistory);
        return newHistory;
      });
      return newTotal;
    });
  }, [target, playClickSound, playCompleteSound, syncStorageDebounced]);

  const handleReset = () => {
    setCount(0);
    playClickSound();
  };

  const handleClearHistory = useCallback(() => {
    setTotalCount(0);
    const cleared: DailyHistory = {};
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      cleared[key] = 0;
    }
    setDailyHistory(cleared);
    localStorage.setItem('tasbih_total_count', '0');
    localStorage.setItem('tasbih_daily_history', JSON.stringify(cleared));
  }, []);

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhrase.trim()) return;
    const trimmed = customPhrase.trim();
    if (!customPhrasesList.includes(trimmed)) {
      setCustomPhrasesList(prev => [...prev, trimmed]);
    }
    setSelectedCategory('custom');
    setSelectedPhrase(trimmed);
    setCustomPhrase('');
    setCount(0);
  };

  const handleDeleteCustomPhrase = (phraseToDelete: string) => {
    setCustomPhrasesList(prev => prev.filter(p => p !== phraseToDelete));
    if (selectedPhrase === phraseToDelete) {
      setSelectedPhrase('اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ');
      setSelectedCategory('salawat');
    }
    setCount(0);
  };

  const progressPercentage = Math.min((count / target) * 100, 100);

  const activeCategoryObj = TASBIH_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl">
            <Heart className="w-5 h-5 fill-current" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
            {isEn ? 'Smart Digital Tasbih' : 'التسبيح الإلكتروني الذكي والسريع'}
          </h3>
        </div>
        <div className="text-xs bg-emerald-50 dark:bg-slate-950 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full font-medium">
          {isEn ? 'Total Dhikr Count:' : 'مجموع تسبيحاتك كلياً:'} <strong className="text-sm font-mono">{totalCount}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Presets and Categorized Selection (Right side / spans 5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">اختر أقسام وأذكار التسبيح المباركة:</p>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/40">
            {TASBIH_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.items.length > 0) {
                    setSelectedPhrase(cat.items[0].text);
                    setTarget(cat.items[0].target);
                  }
                  setCount(0);
                  playClickSound();
                }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {customPhrasesList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('custom');
                  setSelectedPhrase(customPhrasesList[0]);
                  setCount(0);
                  playClickSound();
                }}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCategory === 'custom'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                ✨ أذكاري المخصصة
              </button>
            )}
          </div>

          {/* Active Category Item Chips */}
          <div className="flex flex-col gap-2">
            {selectedCategory !== 'custom' && activeCategoryObj?.items.map((item, idx) => (
              <button
                key={idx}
                id={`phrase-preset-${idx}`}
                type="button"
                onClick={() => {
                  setSelectedPhrase(item.text);
                  setTarget(item.target);
                  setCount(0);
                  playClickSound();
                }}
                className={`w-full text-right p-2.5 text-xs font-bold rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer ${
                  selectedPhrase === item.text
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="leading-relaxed">{item.text}</span>
                <span className="text-[10px] bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-lg shrink-0">
                  {item.target} تكرار
                </span>
              </button>
            ))}

            {selectedCategory === 'custom' && customPhrasesList.map((phrase, idx) => (
              <div
                key={idx}
                className={`w-full text-right p-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  selectedPhrase === phrase
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhrase(phrase);
                    setCount(0);
                    playClickSound();
                  }}
                  className="flex-1 text-right cursor-pointer"
                >
                  {phrase}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomPhrase(phrase)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Form to add custom phrase with 16px font input */}
          <form onSubmit={handleAddPhrase} className="flex gap-2 pt-1">
            <input
              id="custom-phrase-input"
              type="text"
              value={customPhrase}
              onChange={(e) => setCustomPhrase(e.target.value)}
              placeholder="أو اكتب ذكراً خاصاً بك..."
              className="flex-1 px-3 py-2 text-base md:text-sm bg-emerald-50/50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              style={{ fontSize: '16px' }}
            />
            <button
              id="add-custom-phrase-btn"
              type="submit"
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </form>

          {/* Target selection */}
          <div className="space-y-2 border-t border-emerald-100/10 pt-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">حدد هدف التسبيح:</p>
            <div className="grid grid-cols-4 gap-1.5">
              {[33, 100, 1000, 99999].map((val) => (
                <button
                  key={val}
                  id={`target-preset-${val}`}
                  onClick={() => {
                    setTarget(val);
                    setCount(0);
                    playClickSound();
                  }}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    target === val
                      ? 'bg-amber-500 border-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200/40 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {val === 99999 ? 'مفتوح' : val}
                </button>
              ))}
            </div>
          </div>

          {/* Target Daily Goal */}
          <div className="space-y-3 border-t border-emerald-100/10 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>الهدف اليومي العام للتسبيح:</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                {dailyGoal} تسبيحة
              </span>
            </div>

            {/* Daily Goal input and preset buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 300, 500].map((gVal) => (
                <button
                  key={gVal}
                  type="button"
                  id={`daily-goal-preset-${gVal}`}
                  onClick={() => {
                    setDailyGoal(gVal);
                    playClickSound();
                  }}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    dailyGoal === gVal
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {gVal}
                </button>
              ))}

              <div className="flex items-center border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden bg-white dark:bg-slate-950 h-7 px-1.5">
                <input
                  id="daily-goal-custom-input"
                  type="number"
                  min="10"
                  max="100000"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))}
                  className="w-full text-center text-base md:text-xs font-black font-mono text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
                  style={{ fontSize: '16px' }}
                  placeholder="مخصص"
                />
              </div>
            </div>

            {/* Daily progress bar */}
            <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/40">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>منجز اليوم: {todayCount} من {dailyGoal}</span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {Math.round(dailyProgressPercentage)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200/20 dark:border-slate-700/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-200"
                  style={{ width: `${dailyProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* The Clicker Area (Left side / spans 7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4 py-4 border-r border-emerald-100/5 dark:border-slate-800/20">

          <div className="text-center">
            <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 h-7 truncate max-w-[280px]">
              {selectedPhrase}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {target === 99999 ? 'عداد مستمر سريح' : `الهدف الحالي: ${target}`}
            </p>
          </div>

          {/* Interactive Ultra-Fast Counter Circle */}
          <div className="relative flex items-center justify-center w-56 h-56">

            {/* Background progress track */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
              <circle
                cx="112"
                cy="112"
                r="100"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                className="stroke-emerald-600 dark:stroke-emerald-400 transition-all duration-100"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 100}`}
                strokeDashoffset={`${2 * Math.PI * 100 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Tap Button with touch optimizations */}
            <button
              id="tasbih-tap-button"
              onPointerDown={handleIncrement}
              onClick={(e) => {
                // If onPointerDown already handled it, don't duplicate
                if (e.detail !== 0) return;
                handleIncrement(e);
              }}
              className="relative w-44 h-44 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 dark:from-emerald-700 dark:to-teal-600 dark:hover:from-emerald-600 dark:hover:to-teal-500 text-white rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transform transition-none select-none touch-manipulation focus:outline-none cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              {/* Inner glowing circle */}
              <div className="absolute inset-2 border border-white/20 rounded-full bg-black/5 pointer-events-none" />

              <span className="text-xs font-semibold text-emerald-100 tracking-wider select-none">اضغط هنا للذكر</span>
              <span className="text-5xl font-black font-mono mt-1 drop-shadow-sm select-none">
                {count}
              </span>

              {target !== 99999 && (
                <span className="text-[10px] text-emerald-100/80 mt-1 select-none">
                  {Math.round(progressPercentage)}%
                </span>
              )}
            </button>

            {/* Completion celebratory overlay */}
            <AnimatePresence>
              {showCelebrate && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 rounded-full z-10 text-center pointer-events-none"
                >
                  <Sparkles className="w-10 h-10 text-amber-500 animate-bounce mb-1" />
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">قُبِل الطاعة بإذن الله!</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">تَمّت {target} تسبيحة</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Control */}
          <button
            id="tasbih-reset-button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير العداد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
