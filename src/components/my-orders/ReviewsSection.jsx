import { useState } from 'react'
import { FaArrowRight, FaStar } from 'react-icons/fa'

const PENDING_REVIEWS = [
  { id: 'HG-2026-003', from: 'TP Hồ Chí Minh', to: 'Nha Trang', date: '01/06/2026', operator: 'Phương Trang' },
]

const DONE_REVIEWS = [
  {
    id: 'HG-2025-011',
    from: 'TP Hồ Chí Minh',
    to: 'Vũng Tàu',
    date: '14/12/2025',
    operator: 'Kumho Samco',
    rating: 5,
    comment: 'Xe sạch, đúng giờ, tài xế thân thiện. Rất hài lòng!',
  },
  {
    id: 'HG-2025-008',
    from: 'TP Hồ Chí Minh',
    to: 'Đà Lạt',
    date: '02/11/2025',
    operator: 'Thành Bưởi',
    rating: 4,
    comment: 'Chuyến đi ổn, xe tương đối thoải mái.',
  },
]

const StarPicker = ({ value, onChange }) => (
  <div className="rev-section__stars-pick">
    {[1, 2, 3, 4, 5].map((rating) => (
      <button key={rating} type="button" onClick={() => onChange(rating)} className={rating <= value ? 'active' : ''}>
        <FaStar />
      </button>
    ))}
  </div>
)

const StarDisplay = ({ rating }) => (
  <div className="rev-section__stars-display">
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar key={star} className={star <= rating ? 'filled' : ''} />
    ))}
  </div>
)

const ReviewsSection = () => {
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})
  const [submitted, setSubmitted] = useState({})

  const handleSubmit = (id) => {
    setSubmitted((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="orders-page__panel rev-section">
      {PENDING_REVIEWS.length > 0 && (
        <>
          <div className="rev-section__block-title">
            <span className="rev-section__dot rev-section__dot--pending" />
            Chờ đánh giá ({PENDING_REVIEWS.length})
          </div>
          <div className="rev-section__list">
            {PENDING_REVIEWS.map((trip) => (
              <div key={trip.id} className="rev-section__card rev-section__card--pending">
                <div className="rev-section__route">
                  <span>{trip.from}</span>
                  <FaArrowRight className="rev-section__arrow" />
                  <span>{trip.to}</span>
                </div>
                <p className="rev-section__trip-meta">
                  {trip.date} · {trip.operator}
                </p>

                {submitted[trip.id] ? (
                  <div className="rev-section__thanks">Cảm ơn bạn đã đánh giá!</div>
                ) : (
                  <>
                    <StarPicker
                      value={ratings[trip.id] || 0}
                      onChange={(value) => setRatings((prev) => ({ ...prev, [trip.id]: value }))}
                    />
                    <textarea
                      className="rev-section__textarea"
                      placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."
                      value={comments[trip.id] || ''}
                      onChange={(event) => setComments((prev) => ({ ...prev, [trip.id]: event.target.value }))}
                      rows={3}
                    />
                    <button
                      type="button"
                      className="rev-section__submit-btn"
                      disabled={!ratings[trip.id]}
                      onClick={() => handleSubmit(trip.id)}
                    >
                      Gửi đánh giá
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="rev-section__block-title rev-section__done-title">
        <span className="rev-section__dot rev-section__dot--done" />
        Đã đánh giá
      </div>
      <div className="rev-section__list">
        {DONE_REVIEWS.map((review) => (
          <div key={review.id} className="rev-section__card rev-section__card--done">
            <div className="rev-section__route">
              <span>{review.from}</span>
              <FaArrowRight className="rev-section__arrow" />
              <span>{review.to}</span>
            </div>
            <p className="rev-section__trip-meta">
              {review.date} · {review.operator}
            </p>
            <StarDisplay rating={review.rating} />
            <p className="rev-section__comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsSection
