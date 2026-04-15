# Ghi chú thêm ngôn ngữ cho các trang sau này

Luôn làm theo hướng này để không phá cấu trúc hiện tại:

1. Không viết text cứng trực tiếp trong JSX nếu text đó thuộc giao diện.
2. Thêm key mới vào `src/i18n/translations.js` cho cả `vi` và `en`.
3. Trong component, dùng `const { t, locale } = useLanguage()`.
4. Hiển thị text bằng `t('nhom.key')`.
5. Dữ liệu từ database như tên tỉnh, tên nhà xe, slug, mã tuyến: giữ nguyên, không dịch trực tiếp trong DB.
6. Khi format ngày giờ hoặc tiền, dùng `locale` thay vì cố định `vi-VN`.

Format mẫu:

```jsx
import { useLanguage } from '../i18n/LanguageContext'

const ExamplePage = () => {
  const { t, locale } = useLanguage()

  return (
    <section>
      <h1>{t('example.title')}</h1>
      <p>{t('example.description')}</p>
      <span>{new Date().toLocaleDateString(locale)}</span>
    </section>
  )
}
```

Format key nên giữ ổn định:

```js
vi: {
  example: {
    title: 'Tiêu đề',
    description: 'Mô tả',
  },
},
en: {
  example: {
    title: 'Title',
    description: 'Description',
  },
}
```
