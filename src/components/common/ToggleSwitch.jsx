import React from 'react';

const ToggleSwitch = ({ checked, onChange, label, id }) => (
    <label htmlFor={id} className="flex items-center justify-between py-2 cursor-pointer">
        <span className="text-sm text-zinc-800 dark:text-slate-100">{label}</span>
        <button
            id={id}
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full overflow-hidden transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${checked ? 'bg-cyan-500' : 'bg-slate-500 dark:bg-slate-600'}`}
            aria-pressed={checked}
            aria-label={label}
        >
            <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white border border-slate-200 shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </label>
);

export default ToggleSwitch;
