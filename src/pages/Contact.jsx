import { t } from '../content/siteText'

const Contact = () => {
  return (
    <div className="container static-page">
      <h1>{t('contactPage.title')}</h1>
      <p>{t('contactPage.description')}</p>
    </div>
  )
}

export default Contact
