import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

const TYPE_STYLES = {
  error:   'bg-red-950/95 border-red-700 text-red-200',
  success: 'bg-farm-900/90 border-farm-700 text-farm-200',
  warning: 'bg-amber-950/95 border-amber-700 text-amber-200',
  info:    'bg-blue-950/95 border-blue-700 text-blue-200',
}

function Toast({ toast, onDismiss }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-in ${TYPE_STYLES[toast.type] ?? TYPE_STYLES.error}`}>
      <p className="text-sm flex-1 leading-relaxed">{toast.message}</p>
      <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'error') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-3), { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 w-80 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
