import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Phone, KeyRound, Check, Info } from 'lucide-react';

export default function BoltAuthModal({
  isOpen,
  onClose,
  boltSession,
  onSessionUpdated
}) {
  const [phone, setPhone] = useState('+380');
  const [smsCode, setSmsCode] = useState('');
  const [step, setStep] = useState(1); // 1: phone, 2: otp
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const res = await fetch('/api/bolt/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setStatusMessage(data.message || 'SMS-код надіслано на ваш телефон');
      } else {
        setIsError(true);
        setStatusMessage(data.message || 'Помилка надсилання SMS');
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage('Мережева помилка зв’язку з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const res = await fetch('/api/bolt/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: smsCode })
      });
      const data = await res.json();

      if (data.success) {
        setStatusMessage('Авторизація успішна! Живий режим активовано.');
        onSessionUpdated(data.session);
        setTimeout(() => onClose(), 1500);
      } else {
        setIsError(true);
        setStatusMessage(data.message || 'Невірний SMS-код');
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage('Помилка перевірки коду');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bolt-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bolt-dark border border-bolt-darkBorder rounded-3xl max-w-md w-full p-6 shadow-2xl">
        {/* Шапка */}
        <div className="flex items-center justify-between pb-4 border-b border-bolt-darkBorder">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bolt-green/15 border border-bolt-green/30 flex items-center justify-center text-bolt-green">
              {boltSession?.isAuthenticated ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Підключення до Bolt API
              </h2>
              <p className="text-xs text-bolt-textMuted">
                {boltSession?.isAuthenticated
                  ? 'Активна сесія з живими даними'
                  : 'Режим симуляції активний за замовчуванням'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder text-bolt-textMuted hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Інформаційний блок */}
        <div className="my-4 p-3 rounded-2xl bg-bolt-darkCard/60 border border-bolt-darkBorder text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-bolt-green shrink-0 mt-0.5" />
            <p>
              Bolt не має відкритого публічного API. Додаток за замовчуванням надає
              <strong> повний набір самокатів по всіх районах міст України</strong>.
            </p>
          </div>
          <p className="text-[11px] text-bolt-textMuted pl-6">
            За бажанням ви можете авторизувати свій номер телефону, щоб отримувати 100% живі координати безпосередньо з мобільного API Bolt.
          </p>
        </div>

        {/* Статус повідомлення */}
        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              isError
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-bolt-green/15 border border-bolt-green/30 text-bolt-greenLight'
            }`}
          >
            {isError ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Форма авторизації */}
        {!boltSession?.isAuthenticated ? (
          <div>
            {step === 1 ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Номер телефону (Україна)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-bolt-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+380931234567"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-bolt-darkCard border border-bolt-darkBorder text-sm text-white focus:outline-none focus:border-bolt-green font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-bolt-textMuted mt-1">
                    На цей номер Bolt надішле 4-значний SMS-код.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-bolt-green hover:bg-bolt-greenLight text-bolt-black font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {loading ? 'Надсилання...' : 'Отримати SMS-код'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Введіть 4-значний код із SMS
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-bolt-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={e => setSmsCode(e.target.value)}
                      placeholder="1234"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-bolt-darkCard border border-bolt-darkBorder text-sm text-white focus:outline-none focus:border-bolt-green font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 rounded-xl bg-bolt-darkCard hover:bg-bolt-darkBorder border border-bolt-darkBorder text-slate-300 text-xs font-semibold"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-bolt-green hover:bg-bolt-greenLight text-bolt-black font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {loading ? 'Перевірка...' : 'Підтвердити'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-bolt-green/20 text-bolt-green flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Ви успішно підключені до Bolt!</p>
            <p className="text-xs text-bolt-textMuted">
              Номер: {boltSession.phoneNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
