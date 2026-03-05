import { Link } from 'react-router-dom';
import { FaTelegramPlane, FaViber, FaWhatsapp } from 'react-icons/fa';

const Footbar = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto py-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

          {/* Колонка 1: Логотип та копірайт */}
          <div className="flex flex-col space-y-4">
            <Link title="Головна сторінка" to="/" className="inline-block">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase leading-none">
                  Авторозбірка
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-blue-500 tracking-tight uppercase leading-none">
                  Стадники
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              Комплектуючі та деталі з розбірки.
              <br />
              &copy; {new Date().getFullYear()} Всі права захищено.
            </p>
          </div>

          {/* Колонка 2: Навігація */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">Навігація</h3>
            <Link title="Головна сторінка" to="/" className="text-gray-400 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
              Головна
            </Link>
            <Link title="Умови та додаткова інформація" to="/info" className="text-gray-400 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
              Умови та додаткова інформація
            </Link>
            <Link title="Про нас" to="/about" className="text-gray-400 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
              Про нас
            </Link>
          </div>

          {/* Колонка 3: Контакти та соцмережі */}
          <div className="flex flex-col space-y-4 items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-200">Контакти</h3>

            {/* Телефони */}
            <div className="flex flex-col space-y-2 text-gray-400 text-center md:text-left">
              <a title="Телефон" href="tel:+380990000000" className="hover:text-white transition-colors">+38 (099) 000-00-00</a>
              <a title="Телефон" href="tel:+380980000000" className="hover:text-white transition-colors">+38 (098) 000-00-00</a>
            </div>

            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-800 text-white hover:bg-[#7360f2] hover:scale-110 transition-all duration-300 shadow-sm"
                title="Viber"
              >
                <FaViber size={22} className="sm:text-2xl" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-800 text-white hover:bg-[#0088cc] hover:scale-110 transition-all duration-300 shadow-sm"
                title="Telegram"
              >
                <FaTelegramPlane size={22} className="sm:text-2xl" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-800 text-white hover:bg-[#25D366] hover:scale-110 transition-all duration-300 shadow-sm"
                title="WhatsApp"
              >
                <FaWhatsapp size={22} className="sm:text-2xl" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footbar;
