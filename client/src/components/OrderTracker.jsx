const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered']

export default function OrderTracker({ trackingStatus }) {
  const activeIndex = Math.max(0, STEPS.indexOf(trackingStatus))

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, index) => {
        const isActive = index <= activeIndex
        const isLast = index === STEPS.length - 1

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center rounded-full font-bold text-sm transition-all
                  ${isActive
                    ? 'bg-accent text-black w-9 h-9 ring-2 ring-accent ring-offset-2 ring-offset-background'
                    : 'bg-gray-700 text-gray-500 w-7 h-7'
                  }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-1 text-xs whitespace-nowrap ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-1 mb-4 ${
                  index < activeIndex ? 'bg-accent' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
