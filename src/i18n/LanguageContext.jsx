import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const STORAGE_KEY = 'hiusgo-language'
const DEFAULT_LANGUAGE = 'vi'

const LanguageContext = createContext(null)

const getNestedValue = (source, path) => {
  return path.split('.').reduce((currentValue, key) => currentValue?.[key], source)
}

const interpolate = (template, params = {}) => {
  if (typeof template !== 'string') {
    return template
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
    const key = rawKey.trim()
    return params[key] ?? ''
  })
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_LANGUAGE
    }

    const storedLanguage = window.localStorage.getItem(STORAGE_KEY)
    return storedLanguage && translations[storedLanguage] ? storedLanguage : DEFAULT_LANGUAGE
  })

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const value = useMemo(() => {
    const currentTranslations = translations[language]
    const fallbackTranslations = translations[DEFAULT_LANGUAGE]

    return {
      language,
      locale: currentTranslations.meta.locale,
      setLanguage,
      toggleLanguage: () => {
        setLanguage((currentLanguage) => (currentLanguage === 'vi' ? 'en' : 'vi'))
      },
      t: (key, params) => {
        const currentValue = getNestedValue(currentTranslations, key)
        const fallbackValue = getNestedValue(fallbackTranslations, key)
        return interpolate(currentValue ?? fallbackValue ?? key, params)
      },
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }

  return context
}
