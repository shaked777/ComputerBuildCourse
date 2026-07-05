import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'danger' | 'neutral' | 'ghost'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

/**
 * The signature "3D" press button (Brilliant / Duolingo style): a thick bottom
 * edge that compresses when pressed. Built on a normal <button> so it stays
 * accessible and keyboard-friendly.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-correct text-white border-correct-dark hover:bg-correct/95 active:border-correct-dark',
  danger: 'bg-wrong text-white border-wrong-dark hover:bg-wrong/95',
  neutral: 'bg-white text-ink border-line hover:bg-paper',
  ghost: 'bg-transparent text-ink-soft border-transparent hover:bg-black/5',
}

const SIZES: Record<Size, string> = {
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-[58px] px-7 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const press =
    variant === 'ghost'
      ? ''
      : 'border-b-4 active:border-b-0 active:translate-y-[3px] transition-[transform,background-color,border-color] duration-100'

  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold tracking-tight',
        'select-none no-tap focus:outline-none focus-visible:ring-4 focus-visible:ring-correct/30',
        SIZES[size],
        VARIANTS[variant],
        press,
        disabled
          ? 'cursor-not-allowed opacity-100 !bg-line !text-ink-faint !border-line !translate-y-0'
          : 'cursor-pointer',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
