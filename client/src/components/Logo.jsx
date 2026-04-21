import { useState } from 'react'

export default function Logo({ size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false)

  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-16', xl: 'h-24' }
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl', xl: 'text-3xl' }

  if (imgFailed) {
    return (
      <span className={`font-black tracking-widest text-accent ${textSizes[size] ?? textSizes.md} ${className}`}>
        PRIME STEP
      </span>
    )
  }

  return (
    <img
      src="/logo.png"
      alt="Prime Step"
      className={`${heights[size] ?? heights.md} w-auto object-contain ${className}`}
      style={{ mixBlendMode: 'screen' }}
      onError={() => setImgFailed(true)}
    />
  )
}
