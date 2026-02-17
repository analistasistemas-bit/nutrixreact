import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    if (!offlineReady && !needRefresh) return null

    return (
        <div className="fixed right-0 bottom-0 m-4 p-3 border rounded-2xl bg-[#0F172A] border-blue-500/30 shadow-2xl z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col gap-2">
                <div className="text-white text-sm">
                    {offlineReady ? (
                        <span>App pronto para uso offline! 🚀</span>
                    ) : (
                        <span>Nova versão disponível! Deseja atualizar? ✨</span>
                    )}
                </div>
                <div className="flex gap-2 justify-end">
                    {needRefresh && (
                        <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors"
                            onClick={() => updateServiceWorker(true)}
                        >
                            Atualizar
                        </button>
                    )}
                    <button
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                        onClick={() => close()}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReloadPrompt
