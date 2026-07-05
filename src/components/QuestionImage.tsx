import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'

interface QuestionImageProps {
  /** filename inside /public/diagrams */
  src: string
  alt?: string
}

/** Diagram shown above a question. Tap to open a fullscreen, zoomable lightbox. */
export default function QuestionImage({ src, alt = 'דיאגרמה' }: QuestionImageProps) {
  const [open, setOpen] = useState(false)
  // BASE_URL-aware so diagrams load on any deployment path (root or subfolder).
  const url = `${import.meta.env.BASE_URL}diagrams/${src}`

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group relative mb-5 block w-full overflow-hidden rounded-2xl border-2 border-line bg-white p-2 shadow-card no-tap"
        aria-label="הגדלת הדיאגרמה"
      >
        <img src={url} alt={alt} className="mx-auto max-h-[300px] w-auto object-contain" loading="lazy" />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-ink/75 px-2 py-1 text-xs font-semibold text-white opacity-90">
          <Maximize2 size={13} /> הגדלה
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="סגירה"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X size={26} />
            </button>
            <motion.img
              src={url}
              alt={alt}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-full rounded-xl bg-white object-contain shadow-pop"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
