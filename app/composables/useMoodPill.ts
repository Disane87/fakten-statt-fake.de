import type { Mood } from './useFactCheck'

export function useMoodPill(m: Mood): string {
    return `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ` +
        (m === 'positive' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
            m === 'negative' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                m === 'critical' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                    m === 'factual' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                        m === 'emotional' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' :
                            m === 'ironic' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' :
                                'bg-muted text-muted-foreground border-border');
}
