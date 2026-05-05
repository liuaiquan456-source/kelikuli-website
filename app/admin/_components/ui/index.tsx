"use client";
import { cn } from "@/app/admin/_lib/utils";

// ─── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"ghost"|"danger"|"outline";
  size?: "sm"|"md"|"lg";
}
export function Button({ variant="primary", size="md", className, children, ...props }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-2.5 text-sm",
        variant === "primary"   && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-slate-100 text-slate-700 hover:bg-slate-200",
        variant === "ghost"     && "text-slate-600 hover:bg-slate-100",
        variant === "danger"    && "bg-red-600 text-white hover:bg-red-700",
        variant === "outline"   && "border border-slate-200 text-slate-700 hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; variant?: "green"|"red"|"blue"|"yellow"|"orange"|"gray"|"purple"; }
export function Badge({ label, variant="gray" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
      variant === "green"  && "bg-emerald-100 text-emerald-700",
      variant === "red"    && "bg-red-100 text-red-700",
      variant === "blue"   && "bg-blue-100 text-blue-700",
      variant === "yellow" && "bg-yellow-100 text-yellow-700",
      variant === "orange" && "bg-orange-100 text-orange-700",
      variant === "purple" && "bg-purple-100 text-purple-700",
      variant === "gray"   && "bg-slate-100 text-slate-600",
    )}>
      {label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>{children}</div>;
}
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4 border-b border-slate-100 flex items-center justify-between", className)}>{children}</div>;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-800">{children}</h3>;
}
export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600">{label}</label>}
      <input
        className={cn(
          "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors",
          "placeholder:text-slate-400",
          error && "border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; }
export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600">{label}</label>}
      <textarea
        className={cn(
          "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors",
          "placeholder:text-slate-400",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: { value: string; label: string }[]; }
export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600">{label}</label>}
      <select
        className={cn(
          "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors",
          className
        )}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Switch ───────────────────────────────────────────────────────────────────
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string; }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors cursor-pointer",
          checked ? "bg-blue-600" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )} />
      </div>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 whitespace-nowrap", className)}>{children}</th>;
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-slate-700 align-middle", className)}>{children}</td>;
}
export function Tr({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <tr onClick={onClick} className={cn("border-b border-slate-100 hover:bg-slate-50 transition-colors", onClick && "cursor-pointer", className)}>{children}</tr>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon, change, color="blue" }: {
  title: string; value: string | number; icon: React.ReactNode;
  change?: string; color?: "blue"|"green"|"purple"|"orange";
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          color === "blue"   && "bg-blue-100 text-blue-600",
          color === "green"  && "bg-emerald-100 text-emerald-600",
          color === "purple" && "bg-purple-100 text-purple-600",
          color === "orange" && "bg-orange-100 text-orange-600",
        )}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{typeof value === "number" ? value.toLocaleString() : value}</p>
          {change && <p className="text-xs text-emerald-600 font-medium">{change}</p>}
        </div>
      </CardBody>
    </Card>
  );
}
