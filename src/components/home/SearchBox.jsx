import { useState, useEffect } from 'react'
import { getLocations } from '../../services/supabaseClient'
import { t } from '../../content/siteText'
import { sampleLocations } from '../../data/sampleTrips'

const mergeLocations = (remoteLocations = []) => {
  const bySlug = new Map(sampleLocations.map((location) => [location.slug, location]))

  remoteLocations.forEach((location) => {
    if (location?.slug) {
      bySlug.set(location.slug, location)
    }
  })

  return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

const SearchBox = ({ value, onChange, onSearch }) => {
  const [locations, setLocations] = useState(sampleLocations)
  const searchData = value || { from: '', to: '', date: '' }

  useEffect(() => {
    getLocations()
      .then((data) => setLocations(mergeLocations(data)))
      .catch(() => setLocations(sampleLocations))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(searchData)
  }

  const updateSearchData = (field, nextValue) => {
    onChange?.({ ...searchData, [field]: nextValue })
  }

  return (
    <div className="search-box">
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="from">{t('searchBox.from')}</label>
          <select
            id="from"
            value={searchData.from}
            onChange={(e) => updateSearchData('from', e.target.value)}
            required
          >
            <option value="">{t('searchBox.chooseFrom')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="to">{t('searchBox.to')}</label>
          <select
            id="to"
            value={searchData.to}
            onChange={(e) => updateSearchData('to', e.target.value)}
            required
          >
            <option value="">{t('searchBox.chooseTo')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">{t('searchBox.date')}</label>
          <input
            id="date"
            type="date"
            value={searchData.date}
            onChange={(e) => updateSearchData('date', e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-search">{t('searchBox.submit')}</button>
      </form>
    </div>
  )
}

export default SearchBox
