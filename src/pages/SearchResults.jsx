import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchTrips } from '../services/supabaseClient'
import { APP_LOCALE, t } from '../content/siteText'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  useEffect(() => {
    if (from && to && date) {
      setLoading(true)
      setError('')

      searchTrips(from, to, date)
        .then(setTrips)
        .catch((err) => {
          console.error(err)
          setError(t('searchResults.loadError'))
        })
        .finally(() => setLoading(false))

      return
    }

    setTrips([])
    setLoading(false)
  }, [from, to, date])

  if (loading) {
    return <div className="container"><p>{t('searchResults.loading')}</p></div>
  }

  return (
    <div className="search-results-page">
      <div className="container">
        <h2>{t('searchResults.title')}</h2>
        <p>{t('searchResults.routeSummary', { from, to, date })}</p>

        {error && <p>{error}</p>}

        {!error && trips.length === 0 ? (
          <p>{t('searchResults.empty')}</p>
        ) : (
          trips.map((trip) => (
            <div key={trip.id} className="trip-card">
              <h4>{trip.operator.name}</h4>
              <p>{trip.bus_type.name}</p>
              <p>{t('searchResults.departure')}: {new Date(trip.departure_time).toLocaleTimeString(APP_LOCALE)}</p>
              <p>{t('searchResults.price')}: {trip.base_price.toLocaleString(APP_LOCALE)}đ</p>
              <p>{t('searchResults.seats', { count: trip.available_seats })}</p>
              <button type="button">{t('searchResults.selectSeat')}</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SearchResults
