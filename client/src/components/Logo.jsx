// Prime Step Logo component
// Shows only the image (which already contains the full brand name + icon)
// mix-blend-mode: screen removes the dark square background from the PNG
export default function Logo({ size = 'md', className = '' }) {
  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-16', xl: 'h-24' }

  return (
    <img
      src="/logo.png"
      alt="Prime Step"
      className={`${heights[size] ?? heights.md} w-auto object-contain ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
