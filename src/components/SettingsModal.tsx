/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Bell, Volume2, VolumeX, Calendar, Sparkles, Eye, Upload, Trash2, Globe, Moon, Sun, Download } from 'lucide-react';
import { AppSettings } from '../types';
import { PRAYER_COUNTRIES } from '../data/prayerCities';
// @ts-ignore
import defaultLogo from '../assets/images/app_logo_1784266160080.jpg';
// @ts-ignore
import defaultBanner from '../assets/images/mosque_banner_1784263300816.jpg';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 3MB to avoid localStorage limit issues
    if (file.size > 3 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 3 ميجابايت.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (type === 'logo') {
          onUpdateSettings({ ...settings, appLogoUrl: result });
        } else {
          onUpdateSettings({ ...settings, headerBgUrl: result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleAdhan = () => {
    onUpdateSettings({ ...settings, adhanReminder: !settings.adhanReminder });
  };

  const toggleVisualAdhan = () => {
    onUpdateSettings({ ...settings, visualAdhanAlert: !settings.visualAdhanAlert });
  };

  const toggleAzkar = () => {
    onUpdateSettings({ ...settings, azkarReminder: !settings.azkarReminder });
  };

  const changeMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      calculationMethod: e.target.value as AppSettings['calculationMethod'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="settings-modal"
        className="w-full max-w-lg bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col text-right font-sans"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 dark:border-slate-800 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-xl font-bold font-sans">إعدادات التطبيق</h3>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Dedication and Developer Details (REQUIRED AT THE TOP) */}
          <div className="p-5 bg-gradient-to-br from-emerald-600/10 to-amber-600/10 dark:from-emerald-950/30 dark:to-slate-950/30 border border-emerald-500/20 rounded-2xl space-y-4">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                صدقة جارية
              </span>
              <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                تطبيق {settings.appName || "نور الإسلام"}
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {settings.dedicationText || (
                  <>
                    هذا التطبيق صدقة جارية بإذن اللّٰه تعالى عن{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300">لؤي بن حسين</strong>
                    <br />
                    وعن والده رحمه اللّٰه وغفر له
                    <br />
                    وجميع المسلمين والمسلمات الأحياء منهم والأموات.
                  </>
                )}
              </p>
            </div>

            <div className="border-t border-emerald-500/10 pt-3 flex flex-col items-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مطور التطبيق: <strong className="text-slate-700 dark:text-slate-300">{settings.developerName || "لؤي بن حسين"}</strong>
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {/* Snapchat Follow */}
                <a
                  id="snapchat-follow-link"
                  href={settings.snapchatUrl || "https://snapchat.com/t/vezdvWWb"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <span className="font-sans font-extrabold">👻</span>
                  تابعني على سناب شات
                </a>

                {/* Download Source Code ZIP */}
                <a
                  id="download-source-zip-btn"
                  href="/api/download-zip"
                  download="Noor_Al_Islam_SourceCode.zip"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل كود المشروع (ZIP)
                </a>
              </div>
            </div>
          </div>



          {/* Core Configuration Toggles */}
          <div className="space-y-4">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 border-emerald-500 pr-2">
              {settings.language === 'en' ? 'App Preferences & Language' : 'تفضيلات التطبيق واللغة والمظهر'}
            </h5>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {settings.language === 'en' ? 'App Language' : 'لغة التطبيق'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {settings.language === 'en' ? 'Switch between Arabic & English' : 'التحويل بين العربية والإنجليزية'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  id="settings-lang-ar-btn"
                  onClick={() => onUpdateSettings({ ...settings, language: 'ar' })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    (settings.language || 'ar') === 'ar'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  العربية
                </button>
                <button
                  id="settings-lang-en-btn"
                  onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.language === 'en'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {settings.language === 'en' ? 'Dark Mode (Appearance)' : 'الوضع الليلي (المظهر)'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {settings.language === 'en' ? 'Toggle dark / light display mode' : 'التبديل بين المظهر الفاتح والداكن'}
                  </p>
                </div>
              </div>
              <button
                id="settings-toggle-theme-btn"
                onClick={() => onUpdateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.theme === 'dark' ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Country and City Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  الدولة:
                </label>
                <select
                  id="settings-country-select"
                  value={settings.country || 'مملكة البحرين'}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    const countryObj = PRAYER_COUNTRIES.find(c => c.ar === newCountry) || PRAYER_COUNTRIES[0];
                    const firstCity = countryObj.cities[0].ar;
                    onUpdateSettings({ ...settings, country: newCountry, city: firstCity });
                  }}
                  className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PRAYER_COUNTRIES.map((c) => (
                    <option key={c.ar} value={c.ar}>
                      {c.ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  المدينة:
                </label>
                <select
                  id="settings-city-select"
                  value={settings.city || 'المنامة'}
                  onChange={(e) => onUpdateSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(PRAYER_COUNTRIES.find(c => c.ar === (settings.country || 'مملكة البحرين')) || PRAYER_COUNTRIES[0]).cities.map((city) => (
                    <option key={city.ar} value={city.ar}>
                      {city.ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prayer Calculation Method */}
            <div className="flex flex-col gap-1.5 p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                طريقة حساب مواقيت الصلاة:
              </label>
              <select
                id="calculation-method-select"
                value={settings.calculationMethod}
                onChange={changeMethod}
                className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UmmAlQura">جامعة أم القرى (مكة المكرمة)</option>
                <option value="MWL">رابطة العالم الإسلامي</option>
                <option value="ISNA">الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
                <option value="Egypt">الهيئة العامة المصرية للمساحة</option>
              </select>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.soundEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">الأصوات والمؤثرات الصوتية</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">صوت نقرات التسبيح والتنبيهات</p>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.soundEnabled ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Adhan Reminder Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.adhanReminder ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">تذكير مواقيت الصلاة (الأذان)</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">إشعار صوتي عند دخول وقت الأذان والإقامة</p>
                </div>
              </div>
              <button
                id="toggle-adhan-btn"
                onClick={toggleAdhan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.adhanReminder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.adhanReminder ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Visual Adhan Alert Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.visualAdhanAlert ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">تنبيه الأذان المرئي والدعاء</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">عرض نصائح دينية قصيرة وأدعية مباركة عند كل أذان</p>
                </div>
              </div>
              <button
                id="toggle-visual-adhan-btn"
                onClick={toggleVisualAdhan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.visualAdhanAlert ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.visualAdhanAlert ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Azkar Reminder Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.azkarReminder ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">تنبيهات الأذكار اليومية</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">تذكير بقراءة أذكار الصباح والمساء والأدعية</p>
                </div>
              </div>
              <button
                id="toggle-azkar-btn"
                onClick={toggleAzkar}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.azkarReminder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.azkarReminder ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-100 dark:border-slate-800 bg-emerald-50 dark:bg-slate-950/80 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-sans">
          <span>© 2026 - جميع الحقوق محفوظة</span>
          <span>لؤي بن حسين</span>
        </div>
      </div>
    </div>
  );
}
