import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface AccordionItemProps {
  title: string;
  content: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-800">{title}</span>
        <FaChevronDown
          className={`text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoPage: React.FC = () => {
  const accordionData = [
    {
      title: 'Умови доставки',
      content:
        'Доставка здійснюється компанією Нова Пошта по всій території України. Відправка замовлень відбувається протягом 1-2 робочих днів з моменту підтвердження. Вартість доставки розраховується за тарифами перевізника.',
    },
    {
      title: 'Способи оплати',
      content:
        'Ви можете оплатити замовлення при отриманні (післяплата) у відділенні Нової Пошти, або переказати кошти на банківську карту. Для деяких товарів може знадобитися мінімальна передоплата.',
    },
    {
      title: 'Обмін та повернення',
      content:
        "Згідно із Законом України «Про захист прав споживачів», ви маєте право повернути або обміняти товар належної якості протягом 14 днів з моменту покупки. Товар повинен зберігати товарний вигляд та оригінальну упаковку.",
    },
  ];

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12 tracking-tight">
          Доставка, Оплата та Гарантії
        </h1>
        
        <div className="space-y-4">
          {accordionData.map((item, index) => (
            <AccordionItem key={index} title={item.title} content={item.content} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
