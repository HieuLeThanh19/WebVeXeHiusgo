export const CHECKOUT_PROMOS = [
  {
    code: 'HIUSGO10',
    title: 'Giảm 50.000đ',
    discount: 50000,
    minTotal: 200000,
    paymentMethods: ['qr', 'vnpay', 'atm', 'visa', 'momo', 'zalopay', 'shopeepay'],
    description: 'Áp dụng cho đơn từ 200.000đ.',
  },
  {
    code: 'NEWUSER',
    title: 'Giảm 30.000đ (khách mới)',
    discount: 30000,
    minTotal: 150000,
    paymentMethods: ['qr', 'vnpay', 'atm', 'visa'],
    description: 'Chỉ áp dụng thanh toán online.',
  },
  {
    code: 'MOMO10',
    title: 'MoMo giảm 10% (tối đa 30.000đ)',
    discount: 30000,
    minTotal: 150000,
    paymentMethods: ['momo'],
    description: 'Chỉ áp dụng khi thanh toán bằng MoMo.',
  },
  {
    code: 'ZALO15K',
    title: 'ZaloPay giảm 15.000đ',
    discount: 15000,
    minTotal: 100000,
    paymentMethods: ['zalopay'],
    description: 'Chỉ áp dụng khi thanh toán bằng ZaloPay.',
  },
  {
    code: 'HDSG50K',
    title: 'HD Saigon giảm 50.000đ',
    discount: 50000,
    minTotal: 250000,
    paymentMethods: ['vnpay', 'qr'],
    operators: ['Thành Bưởi'],
    description: 'Chỉ áp dụng một số nhà xe/khung giá.',
  },
]

export function evaluatePromo(promo, { total, selectedPayment, trip }) {
  if (promo.minTotal && total < promo.minTotal) {
    return { eligible: false, reason: `Không đủ điều kiện (tối thiểu ${promo.minTotal.toLocaleString('vi-VN')}đ)` }
  }
  if (promo.paymentMethods && !promo.paymentMethods.includes(selectedPayment)) {
    return { eligible: false, reason: 'Không áp dụng cho phương thức thanh toán này' }
  }
  if (promo.operators && !promo.operators.includes(trip?.operator)) {
    return { eligible: false, reason: 'Không áp dụng cho cuốc xe/nhà xe này' }
  }
  return { eligible: true, reason: '' }
}

