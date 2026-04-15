import { useLanguage } from '../i18n/LanguageContext'

const Contact = () => {
  const { t } = useLanguage()

  return (
    <div className="container static-page">
      <h1>{t('contactPage.title')}</h1>
      <p>{t('contactPage.description')}</p>
    </div>
  )
}

export default Contact
