"use client"

import { useEffect, useState } from "react"

/**
 * Debounced copy of a fast-changing value (search inputs). The admin tables
 * filter hundreds of rows per keystroke; filtering on the debounced value
 * keeps typing at frame rate while the input itself stays controlled.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
