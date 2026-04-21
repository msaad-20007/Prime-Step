import { useState } from 'react'

export default function ImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-card flex items-center justify-center text-gray-500 rounded">
        No image available
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full aspect-square overflow-hidden rounded">
        <img
          src={images[activeIndex]}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 overflow-hidden rounded flex-shrink-0 border-2 ${
                i === activeIndex ? 'border-accent' : 'border-transparent'
              }`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
