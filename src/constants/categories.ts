// Экспортируем категории из файла клиента
// Здесь будут системные категории для трат и доходов

export const CATEGORIES = [
  {
    id: 'food',
    name: 'Еда и напитки',
    icon: 'restaurant',
    isSystem: true,
    subcategories: [
      { id: 'groceries', name: 'Продукты' },
      { id: 'restaurant', name: 'Рестораны' },
      { id: 'cafe', name: 'Кафе' },
      { id: 'alcohol', name: 'Алкоголь' },
      { id: 'snacks', name: 'Закуски' },
      { id: 'delivery', name: 'Доставка еды' },
    ],
  },
  {
    id: 'transport',
    name: 'Транспорт',
    icon: 'directions-car',
    isSystem: true,
    subcategories: [
      { id: 'gas', name: 'Бензин' },
      { id: 'parking', name: 'Парковка' },
      { id: 'public_transport', name: 'Общественный транспорт' },
      { id: 'taxi', name: 'Такси' },
      { id: 'car_repair', name: 'Ремонт авто' },
      { id: 'car_insurance', name: 'Страховка авто' },
    ],
  },
  {
    id: 'shopping',
    name: 'Покупки',
    icon: 'shopping-cart',
    isSystem: true,
    subcategories: [
      { id: 'clothes', name: 'Одежда' },
      { id: 'electronics', name: 'Электроника' },
      { id: 'furniture', name: 'Мебель' },
      { id: 'home_goods', name: 'Товары для дома' },
      { id: 'books', name: 'Книги' },
      { id: 'gifts', name: 'Подарки' },
    ],
  },
  {
    id: 'utilities',
    name: 'Коммунальные услуги',
    icon: 'home',
    isSystem: true,
    subcategories: [
      { id: 'electricity', name: 'Электричество' },
      { id: 'water', name: 'Вода' },
      { id: 'gas', name: 'Газ' },
      { id: 'internet', name: 'Интернет' },
      { id: 'phone', name: 'Телефон' },
      { id: 'heating', name: 'Отопление' },
    ],
  },
  {
    id: 'health',
    name: 'Здоровье',
    icon: 'favorite',
    isSystem: true,
    subcategories: [
      { id: 'pharmacy', name: 'Аптека' },
      { id: 'doctor', name: 'Врач' },
      { id: 'dentist', name: 'Стоматолог' },
      { id: 'hospital', name: 'Больница' },
      { id: 'insurance', name: 'Страхование' },
      { id: 'fitness', name: 'Фитнес' },
    ],
  },
  {
    id: 'entertainment',
    name: 'Развлечения',
    icon: 'sports-esports',
    isSystem: true,
    subcategories: [
      { id: 'movies', name: 'Кино' },
      { id: 'music', name: 'Музыка' },
      { id: 'games', name: 'Игры' },
      { id: 'hobbies', name: 'Хобби' },
      { id: 'concerts', name: 'Концерты' },
      { id: 'sports', name: 'Спорт' },
    ],
  },
  {
    id: 'education',
    name: 'Образование',
    icon: 'school',
    isSystem: true,
    subcategories: [
      { id: 'courses', name: 'Курсы' },
      { id: 'books', name: 'Учебники' },
      { id: 'tuition', name: 'Обучение' },
      { id: 'certification', name: 'Сертификация' },
      { id: 'workshops', name: 'Мастер-классы' },
    ],
  },
  {
    id: 'bills',
    name: 'Счета',
    icon: 'receipt',
    isSystem: true,
    subcategories: [
      { id: 'credit_card', name: 'Кредитная карта' },
      { id: 'loan', name: 'Кредит' },
      { id: 'rent', name: 'Аренда' },
      { id: 'subscriptions', name: 'Подписки' },
      { id: 'services', name: 'Услуги' },
    ],
  },
  {
    id: 'personal',
    name: 'Личное',
    icon: 'person',
    isSystem: true,
    subcategories: [
      { id: 'haircut', name: 'Стрижка' },
      { id: 'beauty', name: 'Красота' },
      { id: 'laundry', name: 'Стирка' },
      { id: 'cleaning', name: 'Уборка' },
    ],
  },
  {
    id: 'travel',
    name: 'Путешествия',
    icon: 'flight',
    isSystem: true,
    subcategories: [
      { id: 'hotel', name: 'Отель' },
      { id: 'airplane', name: 'Авиабилеты' },
      { id: 'train', name: 'Поезд' },
      { id: 'vacation', name: 'Отдых' },
    ],
  },
];

export const INCOME_CATEGORIES = [
  {
    id: 'salary',
    name: 'Зарплата',
    icon: 'work',
    isSystem: true,
  },
  {
    id: 'business',
    name: 'Бизнес',
    icon: 'store',
    isSystem: true,
  },
  {
    id: 'investment',
    name: 'Инвестиции',
    icon: 'trending-up',
    isSystem: true,
  },
  {
    id: 'freelance',
    name: 'Фриланс',
    icon: 'laptop',
    isSystem: true,
  },
  {
    id: 'bonus',
    name: 'Бонусы',
    icon: 'stars',
    isSystem: true,
  },
  {
    id: 'other',
    name: 'Другое',
    icon: 'more',
    isSystem: true,
  },
];

