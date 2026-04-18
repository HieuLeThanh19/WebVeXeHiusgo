import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLocations } from '../../services/supabaseClient'
import { t } from '../../content/siteText'

const SearchBox = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState([])
  const [searchData, setSearchData] = useState({ from: '', to: '', date: '' })
  useEffect(() => {
    getLocations().then(setLocations).catch(console.error)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`)
  }

  return (
    <div className="search-box">
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="from">{t('searchBox.from')}</label>
          <select
            id="from"
            value={searchData.from}
            onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
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
            onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
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
            onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn-search">{t('searchBox.submit')}</button>
      </form>
    </div>
  )
}

export default SearchBox
