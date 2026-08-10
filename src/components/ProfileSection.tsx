/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Volume2, 
  Bell, 
  Award, 
  Flame, 
  Heart, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Play, 
  Square, 
  Sparkles,
  Headphones,
  Globe,
  Database
} from 'lucide-react';
import { AppSettings } from '../types';

interface ProfileSectionProps {
  currentUser: any;
  isGuest: boolean;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLogout: () => void;
  isEn?: boolean;
}

export const RECITERS = [
  { id: 'afasy', name: 'الشيخ مشاري راشد العفاسي', sampleText: 'الله أكبر الله أكبر... أشهد أن لا إله إلا الله', country: 'الكويت' },
  { id: 'abdulsamad', name: 'الشيخ عبد الباسط عبد الصمد', sampleText: 'الله أكبر الله أكبر... الصلاة خير من النوم', country: 'مصر' },
  { id: 'sudais', name: 'الشيخ عبد الرحمن السديس', sampleText: 'الله أكبر الله أكبر... حي على الصلاة حي على الفلاح', country: 'المملكة العربية السعودية' },
  { id: 'muaiqly', name: 'الشيخ ماهر المعيقلي', sampleText: 'الله أكبر الله أكبر... لا إله إلا الله', country: 'المملكة العربية السعودية' }
];

export default function ProfileSection({
  currentUser,
  isGuest,
  settings,
  onUpdateSettings,
  onLogout,
  isEn = false
}: ProfileSectionProps) {
  const [playingReciterId, setPlayingReciterId] = useState<string | null>(null);

  // Stats from LocalStorage
  const totalTasbih = parseInt(localStorage.getItem('tasbih_total_count') || '0', 10);
  const favoriteAzkarCount = (JSON.parse(localStorage.getItem('noor_favorite_azkar_ids') || '[]')).length;
  const khatmaPages = (JSON.parse(localStorage.getItem('noor_khatma_read_pages') || '[]')).length;

  // Audio sample playback for Reciters using SpeechSynthesis or WebAudio
  const handlePreviewReciter = (reciterId: string, text: string) => {
    if (playingReciterId === reciterId) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingReciterId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPlayingReciterId(reciterId);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      
      utterance.onend = () => setPlayingReciterId(null);
      utterance.onerror = () => setPlayingReciterId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedReciterObj = RECITERS.find(r => r.id === (settings.selectedReciter || 'afasy')) || RECITERS[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-right font-sans" dir="rtl">
      
      {/* Top Banner & Profile Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-emerald-400 shadow-xl border-2 border-amber-300">
              <img 
                src="/app_avatar.png" 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full shadow-inner"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold font-kufi text-amber-300">
                  {currentUser ? (currentUser.displayName || currentUser.email) : 'مستخدم التطبيق (زائر مبارك)'}
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-300/40 text-amber-300 rounded-full text-xs font-bold">
                  {currentUser ? 'حساب موثق' : 'وضع الزائر'}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {currentUser ? currentUser.email : 'جميع بياناتك محفوظة محلياً وفي سحابة تطبيق نور الإسلام'}
              </p>
              <p className="text-[11px] text-amber-200/80 font-mono">
                المنطقة: {settings.country} - {settings.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              {currentUser ? 'تسجيل الخروج' : 'إعادة تعيين الحساب'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <Award className="w-6 h-6 text-amber-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">{totalTasbih}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">إجمالي التسبيحات</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <Heart className="w-6 h-6 text-rose-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">{favoriteAzkarCount}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">الأذكار المفضلة</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <Flame className="w-6 h-6 text-emerald-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">{khatmaPages} / 604</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">صفحات ختمة القرآن</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <ShieldCheck className="w-6 h-6 text-teal-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">100%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">حفظ المزامنة</span>
        </div>
      </div>

      {/* Reciter Selection Card (أصوات الشيوخ المقرئين) */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Headphones className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                اختيار القارئ والشيخ المفضل (الأذان والتلاوة)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر صوت الشيخ للأذان وتلاوة الأذكار والقرآن في تطبيق نور الإسلام
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-800 dark:text-amber-300 rounded-full text-xs font-extrabold">
            {selectedReciterObj.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RECITERS.map((reciter) => {
            const isSelected = (settings.selectedReciter || 'afasy') === reciter.id;
            const isPlayingThis = playingReciterId === reciter.id;

            return (
              <div
                key={reciter.id}
                onClick={() => onUpdateSettings({ ...settings, selectedReciter: reciter.id as any })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/60 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    🕌
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {reciter.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {reciter.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewReciter(reciter.id, reciter.sampleText);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isPlayingThis
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700'
                    }`}
                    title="استماع لعينة صوتية"
                  >
                    {isPlayingThis ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span className="text-[10px] hidden sm:inline">{isPlayingThis ? 'إيقاف' : 'استماع'}</span>
                  </button>

                  <input
                    type="radio"
                    name="selected_reciter"
                    checked={isSelected}
                    onChange={() => onUpdateSettings({ ...settings, selectedReciter: reciter.id as any })}
                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sequential Notifications Preferences */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="p-2 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-xl">
            <Bell className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
              جدول الإشعارات المتتالية اليومية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تنبيهات الأذكار التلقائية المتتالية لمواعيد الصلاة والصباح والمساء والنوم
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">تنبيهات أذان الصلوات الخمس والفجر والضحى</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">إشعار صوتي ومرئي بدخول كل صلاة مع دعاء دخول الوقت</span>
            </div>
            <input
              type="checkbox"
              checked={settings.adhanReminder}
              onChange={(e) => onUpdateSettings({ ...settings, adhanReminder: e.target.checked })}
              className="accent-emerald-600 w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">إشعارات الأذكار المتتالية (صباح، مساء، نوم)</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">تذكير تلقائي هادئ في الأوقات الفضيلة</span>
            </div>
            <input
              type="checkbox"
              checked={settings.azkarReminder}
              onChange={(e) => onUpdateSettings({ ...settings, azkarReminder: e.target.checked })}
              className="accent-emerald-600 w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">الشاشة المرئية التفاعلية للأذان</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">عرض بطاقة الشريعة الإسلامية والأدعية والنصائح الفقهية عند الأذان</span>
            </div>
            <input
              type="checkbox"
              checked={settings.visualAdhanAlert}
              onChange={(e) => onUpdateSettings({ ...settings, visualAdhanAlert: e.target.checked })}
              className="accent-emerald-600 w-5 h-5 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Code Export / ZIP Info Notice for Publishing */}
      <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-950 border border-emerald-200 dark:border-slate-800 rounded-3xl space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300 text-sm">
          <Database className="w-4 h-4" />
          <span>تصدير التطبيق والملف البرمجي بصيغة ZIP للمتجر</span>
        </div>
        <p>
          تطبيقك جاهز بالكامل للنشر في المتجر! يمكنك في أي وقت النقر على خيار <strong>Export project / ZIP</strong> من القائمة العلوية لمنصة AI Studio لتحميل كامل ملفات الكود البرمجي بضغط زر واحدة ونشرها أو تحويلها لتطبيق هاتف.
        </p>
      </div>

    </div>
  );
}
