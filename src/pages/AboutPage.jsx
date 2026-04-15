import { useLanguage } from '../i18n/LanguageContext'

const AboutPage = () => {
  const { t } = useLanguage()

  return (
    <div className="container static-page">
      <h1>{t('aboutPage.title')}</h1>
      <p>{t('aboutPage.description')}</p>
    </div>
  )
}

export default AboutPage
