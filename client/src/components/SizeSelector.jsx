export default function SizeSelector({ sizes = [], selectedSize, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size, stock }) => {
        const isDisabled = stock === 0
        const isSelected = size === selectedSize

        let className = 'px-4 py-2 rounded text-sm font-medium transition-colors '

        if (isDisabled) {
          className += 'opacity-40 cursor-not-allowed line-through border border-gray-600 text-text-primary'
        } else if (isSelected) {
          className += 'bg-accent text-black border-2 border-accent'
        } else {
          className += 'border border-gray-600 text-text-primary hover:border-accent'
        }

        return (
          <button
            key={size}
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelect(size)}
            className={className}
          >
            {size}
          </button>
        )
      })}
    </div>
  )
}
