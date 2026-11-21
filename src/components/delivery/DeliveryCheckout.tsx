import React, { useState, useMemo } from 'react';
import { Entrepreneur, Order, OrderItem, UserProfile } from '../../types';
import { ArrowLeft, ShoppingCart, MapPin, Calendar, Check, Plus, Minus, UserCheck } from 'lucide-react';

interface DeliveryCheckoutProps {
  entrepreneur: Entrepreneur;
  currentUser: UserProfile;
  onSubmitOrder: (order: Order) => void;
  onCancel: () => void;
}

// Preset grocery bundles for elderly / simplified mode
const PRESET_BUNDLES = [
  {
    id: 'bundle_basic',
    name: '🍞 Базовый набор (Ежедневный)',
    description: 'Хлеб пшеничный, молоко свежее, десяток яиц и сливочное масло.',
    items: [
      { item: 'Хлеб пшеничный', price: 45, unit: 'шт', quantity: 1 },
      { item: 'Молоко 3.2%', price: 85, unit: 'литр', quantity: 2 },
      { item: 'Яйцо куриное С1', price: 110, unit: 'дес', quantity: 1 },
      { item: 'Масло сливочное 82%', price: 180, unit: 'шт', quantity: 1 }
    ]
  },
  {
    id: 'bundle_grocery',
    name: '🌾 Набор бакалеи (Долгое хранение)',
    description: 'Макароны, греча, сахарный песок, мука пшеничная и масло подсолнечное.',
    items: [
      { item: 'Мука пшеничная 2кг', price: 120, unit: 'упак', quantity: 1 },
      { item: 'Сахарный песок 1кг', price: 75, unit: 'кг', quantity: 2 },
      { item: 'Гречневая крупа 800г', price: 90, unit: 'упак', quantity: 1 },
      { item: 'Масло подсолнечное', price: 130, unit: 'бутылка', quantity: 1 }
    ]
  },
  {
    id: 'bundle_dairy',
    name: '🥛 Молочные радости (Свежий удой)',
    description: 'Свежий домашний творог, сметана 20% жирности и литр деревенского кефира.',
    items: [
      { item: 'Молоко 3.2%', price: 85, unit: 'литр', quantity: 2 },
      { item: 'Творог домашний 500г', price: 210, unit: 'упак', quantity: 1 },
      { item: 'Сметана 20% 350г', price: 105, unit: 'банка', quantity: 1 }
    ]
  }
];

export default function DeliveryCheckout({
  entrepreneur,
  currentUser,
  onSubmitOrder,
  onCancel
}: DeliveryCheckoutProps) {
  // Wizard steps: 'cart' -> 'shipping' -> 'confirm'
  const [step, setStep] = useState<'cart' | 'shipping' | 'confirm'>('cart');
  
  // Cart state: item index -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  const [address, setAddress] = useState(currentUser.village + ', ');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('12:00 - 15:00');

  // Pre-load preset bundle for simplified mode
  const selectPresetBundle = (bundleItems: Array<{ item: string; price: number; unit: string; quantity: number }>) => {
    const newCart: Record<string, number> = {};
    // Match bundle items with entrepreneur's price list, or add them temporarily
    bundleItems.forEach(bItem => {
      // Find matching item in entrepreneur price list
      const idx = entrepreneur.priceList.findIndex(p => p.item.toLowerCase().includes(bItem.item.toLowerCase()));
      if (idx !== -1) {
        newCart[idx] = bItem.quantity;
      } else {
        // Fallback: append as an active item index mapped dynamically
        // Just use first index or map with key if not found
        const key = `preset_${bItem.item}`;
        newCart[key] = bItem.quantity;
      }
    });
    setCart(newCart);
    setStep('shipping'); // Skip directly to shipping for elderly comfort!
  };

  const updateCartQty = (key: string | number, change: number) => {
    const current = cart[key] || 0;
    const next = current + change;
    if (next <= 0) {
      const copy = { ...cart };
      delete copy[key];
      setCart(copy);
    } else {
      setCart({ ...cart, [key]: next });
    }
  };

  // Enriched items list in cart
  const cartItems = useMemo<OrderItem[]>(() => {
    const items: OrderItem[] = [];
    Object.keys(cart).forEach(key => {
      const qty = cart[key];
      if (key.startsWith('preset_')) {
        const itemName = key.replace('preset_', '');
        // Find in preset bundle templates
        let foundPrice = 100;
        let foundUnit = 'шт';
        PRESET_BUNDLES.forEach(b => {
          const match = b.items.find(bi => bi.item === itemName);
          if (match) {
            foundPrice = match.price;
            foundUnit = match.unit;
          }
        });
        items.push({
          item: itemName,
          price: foundPrice,
          unit: foundUnit,
          quantity: qty
        });
      } else {
        const idx = Number(key);
        const originalItem = entrepreneur.priceList[idx];
        if (originalItem) {
          items.push({
            item: originalItem.item,
            price: originalItem.price,
            unit: originalItem.unit,
            quantity: qty
          });
        }
      }
    });
    return items;
  }, [cart, entrepreneur.priceList]);

  // Recalculate totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const deliveryFee = 100; // standard fixed rate
  const total = subtotal + deliveryFee;

  const handleNextStep = () => {
    if (step === 'cart') {
      if (cartItems.length === 0) {
        alert('Пожалуйста, выберите хотя бы один продукт');
        return;
      }
      setStep('shipping');
    } else if (step === 'shipping') {
      if (!address.trim() || address.trim() === currentUser.village + ',') {
        alert('Пожалуйста, укажите точный адрес доставки (улица, дом)');
        return;
      }
      if (!deliveryDate) {
        alert('Пожалуйста, выберите желаемую дату доставки');
        return;
      }
      setStep('confirm');
    }
  };

  const handleConfirmOrder = () => {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      userId: currentUser.id,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      entrepreneurId: entrepreneur.id,
      entrepreneurBusinessName: entrepreneur.businessName,
      entrepreneurPhone: entrepreneur.contactPhone,
      items: cartItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: address,
      requestedDeliveryDate: deliveryDate,
      requestedDeliveryTimeSlot: deliveryTimeSlot,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    onSubmitOrder(newOrder);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs max-w-2xl mx-auto" id="delivery_checkout">
      {/* Header Back navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            if (step === 'confirm') setStep('shipping');
            else if (step === 'shipping') setStep('cart');
            else onCancel();
          }}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">
            Заказ у: {entrepreneur.businessName}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold">
            Шаг {step === 'cart' ? '1 из 3: Корзина' : step === 'shipping' ? '2 из 3: Доставка' : '3 из 3: Подтверждение'}
          </p>
        </div>
      </div>

      {/* Step Wizard Indicator Bar */}
      {!currentUser.isSimplifiedMode && (
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1.5 flex-1 rounded-full ${step === 'cart' || step === 'shipping' || step === 'confirm' ? 'bg-brand-medium' : 'bg-slate-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === 'shipping' || step === 'confirm' ? 'bg-brand-medium' : 'bg-slate-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === 'confirm' ? 'bg-brand-medium' : 'bg-slate-100'}`} />
        </div>
      )}

      {/* STEP 1: CART SELECTOR */}
      {step === 'cart' && (
        <div className="space-y-6">
          {/* ELDERLY/SIMPLIFIED PRESET BUNDLES SELECTION */}
          {currentUser.isSimplifiedMode && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
                <p className="text-xs font-black text-slate-800">
                  👵 Облегченный режим заказа: Выберите готовый продуктовый набор в один клик!
                </p>
              </div>

              <div className="space-y-3">
                {PRESET_BUNDLES.map(bundle => (
                  <div key={bundle.id} className="border-4 border-slate-150 rounded-3xl p-5 space-y-3 hover:border-brand-medium bg-white shadow-xs">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{bundle.name}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{bundle.description}</p>
                    </div>

                    {/* Bundle Items breakdown */}
                    <div className="bg-slate-50 rounded-xl p-3 text-[11px] font-bold text-slate-600 space-y-1">
                      {bundle.items.map((b, i) => (
                        <div key={i} className="flex justify-between">
                          <span>• {b.item} ({b.unit})</span>
                          <span>x{b.quantity} шт.</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => selectPresetBundle(bundle.items)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4.5 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-2 border-emerald-400"
                    >
                      <ShoppingCart size={18} />
                      <span>Выбрать этот набор</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Standard picker fallback for elderly who want individual selection */}
              <div className="text-center pt-2">
                <button 
                  onClick={() => {
                    // Turn off simplified mode for a second or just display standard selector below
                    // We will just display the standard list below anyway
                  }} 
                  className="text-xs font-bold text-slate-400 underline cursor-pointer"
                >
                  Или наберите товары поштучно вручную ниже:
                </button>
              </div>
            </div>
          )}

          {/* STANDARD PRICE LIST PICKER */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              🛒 Выберите товары в корзину:
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {entrepreneur.priceList.map((product, idx) => {
                const qty = cart[idx] || 0;
                return (
                  <div key={idx} className="flex items-center justify-between border border-slate-150 p-3.5 rounded-2xl bg-white shadow-xs">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-black text-slate-900 truncate leading-tight">{product.item}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{product.price} ₽ / {product.unit}</p>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-3 bg-brand-medium/10 rounded-xl p-1.5 border border-brand-medium/20 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(idx, -1)}
                          className="p-1 bg-white hover:bg-slate-100 text-brand-medium rounded-lg transition-all cursor-pointer"
                        >
                          <Minus size={12} className="stroke-[3]" />
                        </button>
                        <span className="text-xs font-black text-slate-800 w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(idx, 1)}
                          className="p-1 bg-white hover:bg-slate-100 text-brand-medium rounded-lg transition-all cursor-pointer"
                        >
                          <Plus size={12} className="stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateCartQty(idx, 1)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-3.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-inner shrink-0"
                      >
                        Добавить
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart totals footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <div>
              <p className="text-[10px] text-slate-500 font-bold">Итого продуктов:</p>
              <p className="text-lg font-black text-slate-900 leading-none mt-1">{subtotal} ₽</p>
            </div>

            <button
              onClick={handleNextStep}
              className={`bg-brand-medium hover:bg-brand-medium/90 text-white font-black py-3 px-6 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                currentUser.isSimplifiedMode ? 'bg-emerald-600 hover:bg-emerald-700 text-sm py-4 rounded-2xl border-2 border-emerald-400' : ''
              }`}
            >
              <span>Далее к доставке</span>
              <ArrowLeft className="rotate-180" size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SHIPPING ADDRESS & SCHEDULING */}
      {step === 'shipping' && (
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-medium" />
              <span>📍 Адрес доставки</span>
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500">
                Укажите точный адрес (деревня, улица, дом, примечания)
              </label>
              <input
                type="text"
                required
                placeholder={`с. ${currentUser.village}, ул. Лесная, д. 12`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2.5 text-xs font-bold shadow-xs"
              />
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-medium" />
              <span>📅 Дата и время</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500">Дата подвоза</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500">Желаемый интервал</label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  <option value="09:00 - 12:00">Утро (09:00 - 12:00)</option>
                  <option value="12:00 - 15:00">День (12:00 - 15:00)</option>
                  <option value="15:00 - 18:00">День-Вечер (15:00 - 18:00)</option>
                  <option value="18:00 - 21:00">Вечер (18:00 - 21:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipping actions footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <button
              onClick={() => setStep('cart')}
              className="text-xs font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Вернуться в корзину
            </button>

            <button
              onClick={handleNextStep}
              className={`bg-brand-medium hover:bg-brand-medium/90 text-white font-black py-3 px-6 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                currentUser.isSimplifiedMode ? 'bg-emerald-600 hover:bg-emerald-700 text-sm py-4 rounded-2xl border-2 border-emerald-400' : ''
              }`}
            >
              <span>Перейти к подтверждению</span>
              <ArrowLeft className="rotate-180" size={13} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ORDER CONFIRMATION */}
      {step === 'confirm' && (
        <div className="space-y-5">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide text-center">
              Проверьте ваш заказ перед отправкой
            </h3>

            {/* Recipt Itemised details */}
            <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.item} ({item.unit}) <span className="text-slate-400">x{item.quantity}</span></span>
                  <span>{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>

            {/* Cost Summary block */}
            <div className="border-t border-slate-250 pt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Продукты:</span>
                <span>{subtotal} ₽</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Доставка на дом:</span>
                <span>{deliveryFee} ₽</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-dashed border-slate-200 pt-2">
                <span>Итого к оплате:</span>
                <span className="text-brand-medium font-black">{total} ₽</span>
              </div>
            </div>
          </div>

          {/* Delivery Coordinates list */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-[11px] font-bold text-emerald-800 space-y-1.5">
            <p>📍 <strong>Куда везти:</strong> {address}</p>
            <p>📅 <strong>Когда:</strong> {deliveryDate} в интервале {deliveryTimeSlot}</p>
            <p>🏪 <strong>Кто доставит:</strong> {entrepreneur.businessName} ({entrepreneur.contactPhone})</p>
          </div>

          <div className="bg-slate-100 rounded-lg p-3 text-[10px] text-slate-500 font-bold text-center leading-normal">
            После подтверждения заказ поступит предпринимателю. Он свяжется с вами по указанному в профиле телефону {currentUser.phone} для подтверждения.
          </div>

          {/* Confirmation action block */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <button
              onClick={() => setStep('shipping')}
              className="text-xs font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Изменить адрес
            </button>

            <button
              onClick={handleConfirmOrder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-8 rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md border-2 border-emerald-400 active:scale-95 animate-pulse uppercase tracking-wide"
              id="btn_confirm_order"
            >
              <Check size={16} className="stroke-[3]" />
              <span>Оформить заказ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
