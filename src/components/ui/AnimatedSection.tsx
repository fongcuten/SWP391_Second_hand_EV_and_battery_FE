import type React from "react"
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight"
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  animation = "fadeUp",
}) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: "0px 0px 50px 0px",
  })

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-1000 ease-out"

    switch (animation) {
      case "fadeUp":
        return `${baseClasses} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`
      case "fadeIn":
        return `${baseClasses} ${isVisible ? "opacity-100" : "opacity-0"}`
      case "slideLeft":
        return `${baseClasses} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`
      case "slideRight":
        return `${baseClasses} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`
      default:
        return baseClasses
    }
  }

  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
