import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FieldProps = {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  className?: string
}

const baseField = 'w-full h-10 rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder-ink-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:bg-ink-50'

export function Field({ label, error, hint, children }: { label?: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide">{label}</label>}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ label, error, hint, leftIcon, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{leftIcon}</span>}
        <input {...rest} className={cn(baseField, leftIcon && 'pl-10', error && 'border-red-400 focus:border-red-500 focus:ring-red-200', className)} />
      </div>
    </Field>
  )
}

export function Select({ label, error, hint, className, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      <select {...rest} className={cn(baseField, 'pr-8 appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239CA3AF%27 stroke-width=%272%27><polyline points=%276 9 12 15 18 9%27/></svg>")] bg-no-repeat bg-[length:14px_14px] bg-[right_12px_center]', className)}>
        {children}
      </select>
    </Field>
  )
}

export function Textarea({ label, error, hint, className, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      <textarea {...rest} className={cn('w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-y min-h-[80px]', error && 'border-red-400 focus:border-red-500 focus:ring-red-200', className)} />
    </Field>
  )
}
