import { useState, useCallback } from 'react'

interface UseExternalLinkOptions {
  showBackButton?: boolean
}

export function useExternalLink(options: UseExternalLinkOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [url, setUrl] = useState<string>('')
  const [title, setTitle] = useState<string>('')

  const openLink = useCallback((linkUrl: string, linkTitle?: string) => {
    setUrl(linkUrl)
    setTitle(linkTitle || '')
    setIsVisible(true)
  }, [])

  const closeLink = useCallback(() => {
    setIsVisible(false)
    // Reset after a short delay to allow modal animation to complete
    setTimeout(() => {
      setUrl('')
      setTitle('')
    }, 300)
  }, [])

  return {
    isVisible,
    url,
    title,
    openLink,
    closeLink,
    showBackButton: options.showBackButton || false,
  }
}

