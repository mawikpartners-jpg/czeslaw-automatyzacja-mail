import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

interface FormData {
  file: File | null;
  subject: string;
  body: string;
}

interface FormErrors {
  file?: string;
  subject?: string;
  body?: string;
}

const WEBHOOK_URL = 'https://n8n.procesflow.pl/webhook/08964497-ef6d-42be-825e-1aacaaf60222';

export default function WebhookUploader() {
  const [formData, setFormData] = useState<FormData>({
    file: null,
    subject: '',
    body: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'xlsx') {
        setErrors({ ...errors, file: 'Dozwolone są tylko pliki .xlsx' });
        setFormData({ ...formData, file: null });
        e.target.value = '';
        return;
      }
      setFormData({ ...formData, file });
      setErrors({ ...errors, file: undefined });
    }
  };

  const handleSubjectChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, subject: e.target.value });
    setErrors({ ...errors, subject: undefined });
  };

  const handleBodyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, body: e.target.value });
    setErrors({ ...errors, body: undefined });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.file) {
      newErrors.file = 'Proszę wybrać plik';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Temat jest wymagany';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'Temat nie może przekraczać 100 znaków';
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Treść wiadomości jest wymagana';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append('file', formData.file!);
    data.append('subject', formData.subject.trim());
    data.append('body', formData.body.trim());

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        setMessage({ text: '✅ Formularz został wysłany pomyślnie!', type: 'success' });
        setFormData({ file: null, subject: '', body: '' });
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(`Błąd serwera: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: '❌ Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="bg-white/98 rounded-t-3xl shadow-2xl px-8 py-10 text-center">
          <div className="flex justify-center mb-3">
            <img 
              src="/logo (1).png" 
              alt="Elijzum Smaku Logo" 
              className="h-16 md:h-20 object-contain"
            />
          </div>
          <p className="text-gray-600 text-lg font-light">System Wysyłki Maili</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/98 rounded-b-3xl shadow-2xl px-8 py-10">
          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl font-medium animate-slideDown ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* File Upload */}
            <div className="mb-6">
              <label htmlFor="file" className="block mb-2 font-semibold text-sm" style={{ color: 'var(--color-brand-dark)' }}>
                Plik Excel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div
                  className={`flex items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer
                    ${formData.file 
                      ? 'text-white' 
                      : 'hover:border-[#2a3738] hover:-translate-y-0.5'
                    }`}
                  style={formData.file 
                    ? { backgroundColor: 'var(--color-brand-dark)', borderColor: 'var(--color-brand-dark)' }
                    : { backgroundColor: 'rgba(201, 172, 130, 0.2)', color: 'var(--color-brand-dark)', borderColor: 'var(--color-brand-dark)' }
                  }
                >
                  <span className="text-2xl mr-3">📎</span>
                  <span className="font-medium">
                    {formData.file ? formData.file.name : 'Wybierz plik .xlsx'}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 italic">Akceptowane formaty: .xlsx</p>
              {errors.file && <p className="mt-2 text-sm text-red-500">{errors.file}</p>}
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label htmlFor="subject" className="block mb-2 font-semibold text-sm" style={{ color: 'var(--color-brand-dark)' }}>
                Temat maila <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleSubjectChange}
                maxLength={100}
                placeholder="Wprowadź temat wiadomości"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 
                  focus:outline-none focus:bg-white focus:ring-4 transition-all"
                style={{
                  '--tw-ring-color': 'rgba(63, 78, 79, 0.1)',
                } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand-dark)'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
              />
              <div className="mt-2 text-right text-sm">
                <span className={formData.subject.length >= 90 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                  {formData.subject.length}/100 znaków
                </span>
              </div>
              {errors.subject && <p className="mt-2 text-sm text-red-500">{errors.subject}</p>}
            </div>

            {/* Body */}
            <div className="mb-6">
              <label htmlFor="body" className="block mb-2 font-semibold text-sm" style={{ color: 'var(--color-brand-dark)' }}>
                Treść maila <span className="text-red-500">*</span>
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleBodyChange}
                rows={10}
                placeholder="Wprowadź treść wiadomości..."
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 
                  focus:outline-none focus:bg-white focus:ring-4 transition-all resize-y min-h-[200px]"
                style={{
                  '--tw-ring-color': 'rgba(63, 78, 79, 0.1)',
                } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-brand-dark)'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
              />
              {errors.body && <p className="mt-2 text-sm text-red-500">{errors.body}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-white 
                rounded-xl font-semibold text-lg uppercase tracking-wider transition-all
                hover:-translate-y-1 hover:shadow-2xl
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand-dark) 0%, #2a3738 100%)',
                boxShadow: '0 25px 50px -12px rgba(63, 78, 79, 0.4)',
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Wysyłanie...</span>
                </>
              ) : (
                <span>Wyślij</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}