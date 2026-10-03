import React from 'react';
import { X, Smartphone, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

export default function IosInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bolt-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bolt-dark border border-bolt-darkBorder rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder text-bolt-textMuted hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Шапка */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bolt-green to-bolt-greenDark text-slate-950 flex items-center justify-center font-black shadow-lg shadow-bolt-green/20 shrink-0">
            <Smartphone className="w-6 h-6 text-bolt-black" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Додати на екран iPhone
            </h3>
            <p className="text-xs text-bolt-textMuted">
              Працює як рідний мобільний додаток
            </p>
          </div>
        </div>

        {/* Покрокова інструкція */}
        <div className="space-y-3.5 my-5 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-bolt-darkCard/80 border border-bolt-darkBorder">
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-white">Відкрийте сайт у браузері Safari</p>
              <p className="text-[11px] text-bolt-textMuted mt-0.5 flex items-center gap-1">
                Натисніть кнопку <Share className="w-3.5 h-3.5 text-blue-400 inline" /> «Поділитися» на панелі внизу.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-bolt-darkCard/80 border border-bolt-darkBorder">
            <div className="w-7 h-7 rounded-xl bg-bolt-green/20 text-bolt-green flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-white">Оберіть «На початковий екран»</p>
              <p className="text-[11px] text-bolt-textMuted mt-0.5 flex items-center gap-1">
                Прокрутіть меню вниз та знайдіть пункт з іконкою <PlusSquare className="w-3.5 h-3.5 text-bolt-green inline" />.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-bolt-darkCard/80 border border-bolt-darkBorder">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-white">Натисніть «Додати» (Add)</p>
              <p className="text-[11px] text-bolt-textMuted mt-0.5">
                У правому верхньому кутку екрана.
              </p>
            </div>
          </div>
        </div>

        {/* Переваги */}
        <div className="p-3 rounded-xl bg-bolt-green/10 border border-bolt-green/25 text-[11px] text-bolt-greenLight flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-bolt-green" />
          <span>Іконка з'явиться поруч із іншими додатками та запускатиметься без рамок браузера!</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-bolt-green hover:bg-bolt-greenLight text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          Зрозуміло
        </button>
      </div>
    </div>
  );
}
