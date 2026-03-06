import { FaPhoneAlt, FaEnvelope, FaClock, FaInstagram, FaTelegramPlane, FaMapMarkerAlt } from 'react-icons/fa';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 ">
      <SEO
        title="Про нас"
        description="Про нас Авторозбірка Стадники"
        url="https://lahan-shop.vercel.app/about"
      />
      <div className="max-w-7xl mx-auto">
        {/* Заголовок та опис */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Про нас
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            [Текст-опис: Коротко про компанію Авторозбірка Стадники, чим ми займаємось, наші переваги та цілі.]
          </p>
        </div>

        {/* Сітка на 2 колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Ліва колонка: Контакти */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
              Контакти
            </h2>

            <div className="space-y-6 flex-grow">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-600">
                  <FaPhoneAlt size={20} />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Телефон</h3>
                  <p className="mt-1 text-gray-600">[+38 (000) 000-00-00]</p>
                  <p className="text-gray-600">[+38 (000) 000-00-00]</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-600">
                  <FaEnvelope size={20} />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Email</h3>
                  <p className="mt-1 text-gray-600">[example@email.com]</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-600">
                  <FaClock size={20} />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Графік роботи</h3>
                  <p className="mt-1 text-gray-600">[Пн-Пт: 09:00 - 18:00]</p>
                  <p className="text-gray-600">[Сб: 10:00 - 15:00, Нд: Вихідний]</p>
                </div>
              </div>
            </div>

            {/* Соцмережі */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Ми в соцмережах
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-md"
                  aria-label="Instagram"
                >
                  <FaInstagram size={28} />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center h-14 w-14 rounded-full bg-[#0088cc] text-white hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-md"
                  aria-label="Telegram"
                >
                  <FaTelegramPlane size={28} />
                </a>
              </div>
            </div>
          </div>

          {/* Права колонка: Як нас знайти */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
              Як нас знайти
            </h2>

            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-600">
                <FaMapMarkerAlt size={20} />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Наша адреса</h3>
                <p className="mt-1 text-gray-600">
                  [м. Місто, вул. Вулиця, Будинок]
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  [Додатковий орієнтир: біля заправки / СТО]
                </p>
              </div>
            </div>

            {/* Заглушка для карти */}
            <div className="flex-grow w-full bg-gray-100 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 p-4">
              <div className="text-center">
                <FaMapMarkerAlt size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
                <span className="text-gray-600 font-medium text-lg block">
                  Тут буде Google Карта
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  (Для інтеграції потрібен iframe код або Google Maps API ключ)
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
