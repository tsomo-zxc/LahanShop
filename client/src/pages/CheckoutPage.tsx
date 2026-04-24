import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orders';
import { searchCities, getWarehouses, } from '../services/novaPoshta';
import type { City, Warehouse } from '../services/novaPoshta';
import { FaBuilding, FaMoneyBillWave, FaCreditCard, FaCommentDots, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import SEO from '../components/SEO';


// Carrier types
type Carrier = 'nova' | 'ukr' | 'meest' | 'delivery';
type PaymentMethod = 'cod' | 'card';

// Logos
const LOGOS = {
    nova: "public/Nova_Poshta_logo.svg",
    ukr: "public/site-ua-logo.svg",
    meest: "public/Meest_Corporation_logo.svg",
    delivery: "public/delGroup_logo.svg"
};

const CheckoutPage = () => {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- 1. USER ---
    const [contactName, setContactName] = useState(user?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [comment, setComment] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

    // --- 2. DELIVERY SETTINGS ---
    const [carrier, setCarrier] = useState<Carrier>('nova');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

    // --- 3. MANUAL INPUT DATA ---
    const [manualCity, setManualCity] = useState('');
    const [manualBranch, setManualBranch] = useState('');

    // --- 4. NOVA POSHTA DATA (API) ---
    const [citySearch, setCitySearch] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [isCityListOpen, setIsCityListOpen] = useState(false);

    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [isWarehouseListOpen, setIsWarehouseListOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // --- REFS ---
    const cityWrapperRef = useRef<HTMLDivElement>(null);
    const warehouseWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cityWrapperRef.current && !cityWrapperRef.current.contains(event.target as Node)) {
                setIsCityListOpen(false);
            }
            if (warehouseWrapperRef.current && !warehouseWrapperRef.current.contains(event.target as Node)) {
                setIsWarehouseListOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (citySearch.length > 1 && !selectedCity && carrier === 'nova') {
                const results = await searchCities(citySearch);
                setCities(results);
                if (results.length > 0) setIsCityListOpen(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [citySearch, selectedCity, carrier]);

    useEffect(() => {
        if (selectedCity && carrier === 'nova') {
            setWarehouseSearch('');
            getWarehouses(selectedCity.Ref).then(data => {
                setWarehouses(data);
                setFilteredWarehouses(data);
            });
        }
    }, [selectedCity, carrier]);

    useEffect(() => {
        if (warehouseSearch === '') {
            setFilteredWarehouses(warehouses);
        } else {
            const lowerTerm = warehouseSearch.toLowerCase();
            setFilteredWarehouses(warehouses.filter(w => w.Description.toLowerCase().includes(lowerTerm)));
        }
    }, [warehouseSearch, warehouses]);


    // --- NP HANDLERS ---
    const handleCitySelect = (city: City) => {
        setSelectedCity(city);
        setCitySearch(city.Present);
        setIsCityListOpen(false);
        setWarehouseSearch('');
        setIsWarehouseListOpen(true);
    };

    const handleWarehouseSelect = (wh: Warehouse) => {
        setWarehouseSearch(wh.Description);
        setIsWarehouseListOpen(false);
    };

    // --- ORDER SUBMISSION ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. CONTACT VALIDATION
        const newErrors: { name?: string; phone?: string } = {};

        if (!contactName.trim()) {
            newErrors.name = "Будь ласка, введіть ваше ім'я та прізвище";
        }
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
            newErrors.phone = "Введіть коректний номер телефону";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsLoading(true);

        try {
            let fullAddress = '';

            // 2. DELIVERY VALIDATION
            if (carrier === 'nova') {
                const isValidWarehouse = warehouses.some(w => w.Description === warehouseSearch);
                if (!selectedCity || !isValidWarehouse) {
                    alert("Будь ласка, оберіть місто та відділення Нової Пошти зі списку!");
                    setIsLoading(false);
                    return;
                }
                fullAddress = `Нова Пошта: ${selectedCity.Present}, ${warehouseSearch}`;
            }
            else {
                if (manualCity.length < 3 || manualBranch.length < 1) {
                    alert("Будь ласка, вкажіть місто та номер відділення/адресу!");
                    setIsLoading(false);
                    return;
                }
                const carrierNames = { ukr: "Укрпошта", meest: "Meest Express", delivery: "Delivery" };
                fullAddress = `${carrierNames[carrier]}: м. ${manualCity}, ${manualBranch}`;
            }

            // 3. DATA FORMATION
            const paymentInfo = paymentMethod === 'cod' ? 'Оплата при отриманні' : 'Оплата карткою';
            const finalComment = `${paymentInfo}. ${comment}`;

            const orderData = {
                contactName,
                phoneNumber,
                customerAddress: fullAddress + ` | Коментар: ${finalComment}`,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const response = await createOrder(orderData);
            clearCart();
            navigate(`/order-success/${response.orderId}`);

        } catch (err: any) {
            console.error(err);
            alert("Помилка створення замовлення. Спробуйте ще раз.");
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) return <div>Кошик порожній</div>;

    return (
        <div className="container mx-auto px-4 py-8 pt-24 min-h-screen bg-gray-50">
            <SEO
                title="Оформлення замовлення"
                robots="noindex, nofollow"
            />
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Оформлення замовлення</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. CONTACTS */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                            Контактні дані
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* NAME FIELD */}
                            <div>
                                <label className="label">ПІБ Отримувача <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`input-field ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    value={contactName}
                                    onChange={e => {
                                        setContactName(e.target.value);
                                        if (errors.name) setErrors({ ...errors, name: undefined }); // Прибираємо помилку при введенні
                                    }}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <FaExclamationCircle /> {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* PHONE FIELD */}
                            <div>
                                <label className="label">Телефон <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    className={`input-field ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                    placeholder="+380..."
                                    value={phoneNumber}
                                    onChange={e => {
                                        setPhoneNumber(e.target.value);
                                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                                    }}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <FaExclamationCircle /> {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. DELIVERY */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                            Доставка
                        </h2>

                        {/* Carrier selection */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                { id: 'nova', name: 'Нова Пошта', logo: LOGOS.nova },
                                { id: 'ukr', name: 'Укрпошта', logo: LOGOS.ukr },
                                { id: 'meest', name: 'Meest', logo: LOGOS.meest },
                                { id: 'delivery', name: 'Delivery', logo: LOGOS.delivery },
                            ].map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => setCarrier(c.id as Carrier)}
                                    className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all h-24 ${carrier === c.id
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <img
                                        src={c.logo}
                                        alt={c.name}
                                        className={`h-8 w-auto object-contain ${c.id === 'delivery' ? 'bg-[#009A44] px-2 py-1 rounded' : ''
                                            }`}
                                    />
                                    <span className={`text-xs font-bold ${carrier === c.id ? 'text-blue-700' : 'text-gray-500'}`}>
                                        {c.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-md border border-gray-100">
                            <FaBuilding className="text-gray-400" />
                            <span>Доставка <strong>у відділення</strong> обраної служби</span>
                        </div>

                        {/* OPTION A: NOVA POSHTA (API) */}
                        {carrier === 'nova' && (
                            <div className="space-y-4">
                                <div className="relative" ref={cityWrapperRef}>
                                    <label className="label">Місто (Пошук)</label>
                                    <input
                                        type="text" className="input-field" placeholder="Почніть вводити місто..."
                                        value={citySearch}
                                        onFocus={() => { if (cities.length > 0) setIsCityListOpen(true); }}
                                        onChange={e => { setCitySearch(e.target.value); setSelectedCity(null); if (e.target.value.length > 1) setIsCityListOpen(true); }}
                                    />
                                    {isCityListOpen && cities.length > 0 && (
                                        <ul className="dropdown-list">
                                            {cities.map(city => (
                                                <li key={city.Ref} onClick={() => handleCitySelect(city)} className="dropdown-item">
                                                    {city.Present}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="relative" ref={warehouseWrapperRef}>
                                    <label className="label">Відділення (Пошук)</label>
                                    <input
                                        type="text" className="input-field disabled:bg-gray-100"
                                        placeholder={!selectedCity ? "Спочатку оберіть місто" : "Введіть номер..."}
                                        disabled={!selectedCity}
                                        value={warehouseSearch}
                                        onFocus={() => setIsWarehouseListOpen(true)}
                                        onChange={e => { setWarehouseSearch(e.target.value); setIsWarehouseListOpen(true); }}
                                    />
                                    {isWarehouseListOpen && selectedCity && filteredWarehouses.length > 0 && (
                                        <ul className="dropdown-list">
                                            {filteredWarehouses.map(wh => (
                                                <li key={wh.Ref} onClick={() => handleWarehouseSelect(wh)} className="dropdown-item">
                                                    {wh.Description}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* OPTION B: MANUAL ENTRY */}
                        {carrier !== 'nova' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800 flex items-start gap-2">
                                    <FaInfoCircle className="mt-0.5" />
                                    <span>Для служби <strong>{carrier === 'ukr' ? 'Укрпошта' : carrier === 'meest' ? 'Meest' : 'Delivery'}</strong> введіть дані відділення вручну.</span>
                                </div>

                                <div>
                                    <label className="label">Місто / Населений пункт</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="напр. Київ"
                                        value={manualCity}
                                        onChange={e => setManualCity(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="label">
                                        {carrier === 'ukr' ? 'Індекс та адреса відділення' : 'Номер відділення або адреса'}
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={carrier === 'ukr' ? "01001, вул. Хрещатик..." : "Відділення №1, вул. Шевченка..."}
                                        value={manualBranch}
                                        onChange={e => setManualBranch(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. PAYMENT */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                            Оплата
                        </h2>
                        <div className="space-y-3">
                            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="payment" className="mr-3" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                <FaMoneyBillWave className="text-green-600 mr-2" />
                                <span>Оплата при отриманні</span>
                            </label>
                            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}>
                                <input type="radio" name="payment" className="mr-3" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <FaCreditCard className="text-blue-600 mr-2" />
                                <span>Оплата карткою</span>
                            </label>
                        </div>
                    </div>

                    {/* 4. COMMENT */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <FaCommentDots className="text-gray-400" /> Коментар до замовлення
                        </h2>
                        <textarea
                            className="input-field"
                            rows={2}
                            placeholder="Додаткові побажання..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-44">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Разом до оплати</h2>

                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                            {items.map(item => (
                                <div key={item.productId} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} <span className="text-xs">x{item.quantity}</span></span>
                                    <span className="font-medium">{(item.price * item.quantity).toFixed(0)} грн</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Сума:</span>
                                <span>{totalPrice} грн</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>Доставка:</span>
                                <span>за тарифами перевізника</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Обробка...' : 'Підтвердити замовлення'}
                        </button>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Натискаючи кнопку, ви погоджуєтесь з умовами публічної оферти
                        </p>
                    </div>
                </div>
            </div>

            {/* STYLES */}
            <style>{`
            .input-field {
                @apply mt-1 block w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all;
                width: 100%;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                padding: 0.625rem;
            }
            .input-field:focus {
                border-color: #3b82f6;
                outline: 2px solid #3b82f6; 
                outline-offset: -1px;
            }
            .label {
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.25rem;
                display: block;
            }
            .dropdown-list {
                position: absolute;
                z-index: 50;
                width: 100%;
                background-color: white;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                max-height: 15rem;
                overflow-y: auto;
                margin-top: 0.25rem;
            }
            .dropdown-item {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
            }
            .dropdown-item:hover {
                background-color: #eff6ff;
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
        </div>
    );
};

export default CheckoutPage;