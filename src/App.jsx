import React, { useState } from 'react';
import { ShoppingBag, Leaf, X, Plus, Minus, ChevronRight, CheckCircle, Coffee, Check, Trash2 } from 'lucide-react';
import { menuData } from './data/menu';

// --- FIREBASE IMPORTS ---
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; 

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('12oz');
  const [quantity, setQuantity] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  const addToCart = () => {
    if (!selectedProduct) return;
    const price = selectedProduct.sizes ? selectedProduct.sizes[selectedSize] : selectedProduct.price;
    const cartItemId = selectedProduct.sizes ? `${selectedProduct.id}-${selectedSize}` : selectedProduct.id;

    const newItem = {
      id: cartItemId,
      name: selectedProduct.name,
      size: selectedProduct.sizes ? selectedSize : null,
      price: price,
      quantity: quantity,
      image: selectedProduct.image
    };

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, newItem];
    });

    closeModal();
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize('12oz');
    setQuantity(1);
  };

  const closeModal = () => setSelectedProduct(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        customer: customer,
        items: cart,
        totalAmount: cartTotal,
        status: 'pending', 
        createdAt: serverTimestamp()
      });
      setCart([]);
      setOrderSuccess(true);
      setIsCheckingOut(false);
      setCustomer({ name: '', phone: '', address: '' }); 
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("There was an error saving your order. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCartEntirely = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setOrderSuccess(false);
      setIsCheckingOut(false);
    }, 300); 
  };

  const renderProductCard = (product, isDrink = false) => {
    const startingPrice = isDrink ? product.sizes['12oz'] : product.price;
    return (
      <div 
        key={product.id} 
        onClick={() => openProductModal(product)} 
        className="bg-black/15 backdrop-blur-md rounded-2xl shadow-lg border border-sage-green/30 overflow-hidden hover:border-sage-green hover:bg-black/25 hover:shadow-[0_0_25px_rgba(143,151,121,0.35)] transition-all duration-300 cursor-pointer group flex flex-col"
      >
        <div className="h-48 bg-black/10 flex items-center justify-center relative overflow-hidden">
          <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition duration-500" onError={(e) => {e.target.src = 'https://via.placeholder.com/300?text=Image+Coming+Soon'}} />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h4 className="text-xl font-bold mb-1 text-cream group-hover:text-sage-green transition">{product.name}</h4>
          <p className="text-sm text-sage-green/70 mb-4 font-medium">{isDrink ? "3 Sizes Available" : "Freshly Made"}</p>
          <div className="mt-auto flex justify-between items-center">
             <span className="font-bold text-cream text-lg">{isDrink ? 'From ' : ''}₱{startingPrice.toFixed(2)}</span>
             {/* Sage green accent button */}
             <div className="bg-sage-green/20 text-sage-green p-2 rounded-xl group-hover:bg-sage-green group-hover:text-cream transition shadow-[0_0_10px_rgba(143,151,121,0.1)]"><Plus size={20} /></div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW 1: INTRO SPLASH SCREEN
  // ==========================================
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Optimized background - image more visible but maintaining dark filter */}
        <div className="absolute inset-0 bg-[url('/images/background.png')] bg-cover bg-center opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
        
        <div className="absolute -top-24 -left-24 text-sage-green opacity-20"><Leaf size={300} /></div>
        <div className="absolute -bottom-24 -right-24 text-sage-green opacity-20"><Leaf size={300} /></div>

        <div className="z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
          <div className="w-80 md:w-96 mb-6 drop-shadow-2xl hover:scale-105 transition-transform duration-500 bg-sage-green/90 px-8 py-4 rounded-3xl shadow-[0_0_40px_rgba(143,151,121,0.3)] border-2 border-sage-green/50">
            <img src="/images/logo.png" alt="VerdéMelt Logo" className="w-full h-full object-contain" />
          </div>

          <p className="text-xl md:text-2xl text-sage-green mb-12 font-medium max-w-md drop-shadow-[0_0_15px_rgba(143,151,121,0.3)]">
            Taste That Melts, Green That Helps.
          </p>

          <button
            onClick={() => setHasStarted(true)}
            className="group bg-sage-green text-black px-10 py-5 rounded-full font-bold text-xl hover:bg-soft-green hover:text-dark-green transition-all duration-300 shadow-[0_0_30px_rgba(143,151,121,0.6)] hover:shadow-[0_0_40px_rgba(209,232,226,0.5)] flex items-center gap-3 border-2 border-sage-green/50 hover:border-soft-green"
          >
            Start Ordering
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
          
          <div className="mt-8 flex gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-green/50"></span>
            <span className="w-2 h-2 rounded-full bg-sage-green/30"></span>
            <span className="w-2 h-2 rounded-full bg-sage-green/50"></span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: MAIN STOREFRONT (ENHANCED DARK & SAGE MODE)
  // ==========================================
  return (
    <div className="min-h-screen relative animate-in fade-in duration-500 pb-12">
      
      {/* Background - Added a slight sage tint to the black gradient */}
      <div className="fixed inset-0 z-[-1] bg-black">
        <div className="absolute inset-0 bg-[url('/images/background.png')] bg-cover bg-center opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
      </div>
      
      {/* Navigation - Clean and transparent-leaning */}
      <nav className="bg-black/80 backdrop-blur-md p-4 sticky top-0 z-40 border-b border-sage-green/20 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center cursor-pointer bg-cream/95 px-4 py-1.5 rounded-2xl shadow-[0_0_15px_rgba(253,251,247,0.1)] hover:scale-105 transition-transform" onClick={() => setActiveCategory('All')}>
            <img src="/images/logo.png" alt="VerdéMelt Logo" className="h-10 w-auto object-contain" />
          </div>

          <button onClick={() => setIsCartOpen(true)} className="p-2.5 bg-sage-green/10 border border-sage-green/30 hover:bg-sage-green hover:border-sage-green text-sage-green hover:text-cream rounded-full transition-all flex items-center relative shadow-[0_0_10px_rgba(143,151,121,0.1)] backdrop-blur-md">
            <ShoppingBag size={24} />
            {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-cream text-dark-green text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md border border-sage-green">{cartItemCount}</span>}
          </button>
        </div>
      </nav>

      {/* Hero - Amplified banner to command attention */}
      <header className="pt-16 pb-6 px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Subtle gradient text effect to make the title pop */}
          <h2 className="text-4xl md:text-6xl font-black mb-3 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cream to-sage-green drop-shadow-[0_0_15px_rgba(143,151,121,0.3)]">Our Menu</h2>
          <p className="text-base md:text-xl text-sage-green font-medium">Select your favorites below to build your order.</p>
        </div>
      </header>

      {/* Category Filter Bar - Stripped of background boxes, transformed to minimalist tabs */}
      <div className="sticky top-[75px] z-30 pt-2 pb-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="max-w-6xl mx-auto px-4 flex gap-6 md:gap-10 overflow-x-auto no-scrollbar justify-center md:justify-center border-b border-sage-green/20">
          {['All', 'Drinks', 'Spinach', 'Combos'].map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap pb-3 font-bold text-lg md:text-xl transition-all duration-300 border-b-[3px] ${
                activeCategory === category
                  ? 'border-sage-green text-sage-green drop-shadow-[0_0_10px_rgba(143,151,121,0.6)]' // Active: Glowing sage text and border
                  : 'border-transparent text-cream/40 hover:text-cream hover:border-sage-green/50' // Inactive: Muted cream, fades in on hover
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        
        {(activeCategory === 'All' || activeCategory === 'Drinks') && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Headers now feature more Sage Green */}
            <h3 className="text-2xl font-bold text-sage-green mb-6 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(143,151,121,0.2)]">
              <span className="bg-sage-green/10 border border-sage-green/30 backdrop-blur-sm p-2 rounded-lg"><Coffee size={20} className="text-sage-green"/></span>
              Refreshing Drinks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{menuData.drinks.map(drink => renderProductCard(drink, true))}</div>
          </section>
        )}
        
        {(activeCategory === 'All' || activeCategory === 'Spinach') && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold text-sage-green mb-6 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(143,151,121,0.2)]">
               <span className="bg-sage-green/10 border border-sage-green/30 backdrop-blur-sm p-2 rounded-lg"><Leaf size={20} className="text-sage-green"/></span>
               Spinach Specials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">{menuData.spinach.map(item => renderProductCard(item))}</div>
          </section>
        )}
        
        {(activeCategory === 'All' || activeCategory === 'Combos') && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold text-sage-green mb-6 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(143,151,121,0.2)]">
               <span className="bg-sage-green/10 border border-sage-green/30 backdrop-blur-sm p-2 rounded-lg"><ShoppingBag size={20} className="text-sage-green"/></span>
               Value Combos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{menuData.combos.map(combo => renderProductCard(combo))}</div>
          </section>
        )}
        
      </main>

      {/* Product Details Modal - Sage Focus */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#12160f] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-sage-green/40">
            <button onClick={closeModal} className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-sage-green text-cream transition z-50 shadow-md"><X size={20} /></button>
            <div className="h-80 relative bg-black/60 flex items-center justify-center overflow-hidden">
              <img src={selectedProduct.image} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-110" alt="" />
              <img src={selectedProduct.image} alt={selectedProduct.name} className="relative z-10 w-full h-full object-contain p-4 drop-shadow-2xl" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-sage-green drop-shadow-sm">{selectedProduct.name}</h3>
              {selectedProduct.sizes && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-sage-green/70 mb-3 uppercase tracking-wider">Select Size</p>
                  <div className="flex gap-3">
                    {Object.entries(selectedProduct.sizes).map(([size, price]) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`flex-1 py-2 rounded-xl border transition ${selectedSize === size ? 'border-sage-green bg-sage-green/20 text-sage-green font-bold shadow-[0_0_10px_rgba(143,151,121,0.2)]' : 'bg-black/40 border-sage-green/20 text-cream/60 hover:border-sage-green/50 hover:text-cream'}`}>
                        {size} <br/> <span className={`text-sm font-normal ${selectedSize === size ? 'text-cream' : 'text-cream/50'}`}>₱{price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-8">
                <span className="font-semibold text-sage-green/80">Quantity</span>
                <div className="flex items-center gap-4 bg-black/40 border border-sage-green/30 rounded-full px-4 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-sage-green hover:text-cream transition"><Minus size={18} /></button>
                  <span className="font-bold w-4 text-center text-cream">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-sage-green hover:text-cream transition"><Plus size={18} /></button>
                </div>
              </div>
              <button onClick={addToCart} className="w-full bg-sage-green text-cream py-4 rounded-xl font-bold text-lg hover:bg-cream hover:text-dark-green transition shadow-[0_0_15px_rgba(143,151,121,0.3)] flex justify-between px-6">
                <span>Add to Order</span>
                <span>₱{((selectedProduct.sizes ? selectedProduct.sizes[selectedSize] : selectedProduct.price) * quantity).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer & Checkout Form - Sage Focus */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCartEntirely}></div>
          <div className="bg-[#12160f] w-full max-w-md h-full relative flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-sage-green/30">
            
            <div className="p-6 border-b border-sage-green/20 flex justify-between items-center bg-black/40">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-cream">
                {orderSuccess ? "Order Confirmed" : isCheckingOut ? "Checkout Details" : <><ShoppingBag className="text-sage-green" /> Your Bag</>}
              </h2>
              <button onClick={closeCartEntirely} className="p-2 hover:bg-sage-green/20 text-sage-green rounded-full transition"><X size={24} /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {orderSuccess ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
                    <CheckCircle size={80} className="text-sage-green drop-shadow-[0_0_15px_rgba(143,151,121,0.5)]" />
                    <h3 className="text-2xl font-bold text-cream">Order Sent!</h3>
                    <p className="text-sage-green font-medium">Your order has been sent to the kitchen. We will process it shortly.</p>
                 </div>
              ) : isCheckingOut ? (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <label className="block text-sm font-semibold text-sage-green mb-1">Full Name</label>
                    <input required type="text" placeholder="Juan Dela Cruz" className="w-full p-3 border border-sage-green/30 rounded-xl focus:outline-none focus:border-sage-green focus:shadow-[0_0_10px_rgba(143,151,121,0.2)] bg-black/40 text-cream placeholder-gray-600 transition" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-sage-green mb-1">Phone Number</label>
                    <input required type="tel" placeholder="0912 345 6789" className="w-full p-3 border border-sage-green/30 rounded-xl focus:outline-none focus:border-sage-green focus:shadow-[0_0_10px_rgba(143,151,121,0.2)] bg-black/40 text-cream placeholder-gray-600 transition" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-sage-green mb-1">Delivery Address</label>
                    <textarea required placeholder="e.g., 123 MacArthur Highway, Valenzuela City" rows="3" className="w-full p-3 border border-sage-green/30 rounded-xl focus:outline-none focus:border-sage-green focus:shadow-[0_0_10px_rgba(143,151,121,0.2)] bg-black/40 text-cream placeholder-gray-600 transition" value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})}></textarea>
                  </div>
                  <div className="bg-sage-green/10 border border-sage-green/20 p-4 rounded-xl mt-6">
                    <p className="flex justify-between font-bold text-cream">Total to Pay: <span className="text-xl text-sage-green drop-shadow-sm">₱{cartTotal.toFixed(2)}</span></p>
                    <p className="text-xs text-sage-green/70 mt-1 font-medium">*Payment collected upon delivery/pickup.</p>
                  </div>
                </form>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-sage-green space-y-4 opacity-70">
                  <ShoppingBag size={64} className="opacity-40" />
                  <p className="text-lg font-medium">Your bag is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-sage-green/20 shadow-sm hover:border-sage-green/50 transition">
                    <div className="h-20 w-20 bg-black/60 rounded-xl overflow-hidden flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-cream leading-tight">{item.name}</h4>
                      {item.size && <p className="text-sm text-sage-green font-medium">{item.size}</p>}
                      <p className="font-bold mt-1 text-cream">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-sage-green/10 rounded-lg p-1 border border-sage-green/20">
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 text-sage-green hover:text-cream transition"><Plus size={16} /></button>
                      <span className="font-bold text-sm w-4 text-center text-cream">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 text-sage-green hover:text-cream transition"><Minus size={16} /></button>
                      <form onSubmit={(e) => { e.preventDefault(); removeFromCart(item.id); }} className="mt-1">
                        <button type="submit" className="p-1 text-rose-400 hover:text-rose-200 transition" aria-label="Remove item">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {!orderSuccess && cart.length > 0 && (
              <div className="p-6 border-t border-sage-green/20 bg-black/60 z-10 flex flex-col gap-3">
                {isCheckingOut ? (
                  <>
                    <button form="checkout-form" type="submit" disabled={isSubmitting} className="w-full bg-sage-green text-cream py-4 rounded-xl font-bold text-lg hover:bg-cream hover:text-dark-green transition shadow-[0_0_15px_rgba(143,151,121,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                      {isSubmitting ? "Processing..." : <><Check size={20}/> Confirm & Place Order</>}
                    </button>
                    <button onClick={() => setIsCheckingOut(false)} className="w-full text-sage-green/70 py-2 font-bold hover:text-sage-green transition">Back to Cart</button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2 text-lg">
                      <span className="font-bold text-sage-green">Subtotal</span>
                      <span className="font-bold text-2xl text-cream">₱{cartTotal.toFixed(2)}</span>
                    </div>
                    <button onClick={() => setIsCheckingOut(true)} className="w-full bg-sage-green text-cream py-4 rounded-xl font-bold text-lg hover:bg-cream hover:text-dark-green transition shadow-[0_0_15px_rgba(143,151,121,0.3)]">
                      Proceed to Checkout
                    </button>
                  </>
                )}
              </div>
            )}
            
            {orderSuccess && (
               <div className="p-6 border-t border-sage-green/20 bg-black/60">
                  <button onClick={closeCartEntirely} className="w-full bg-sage-green text-cream py-4 rounded-xl font-bold text-lg hover:bg-cream hover:text-dark-green transition shadow-[0_0_15px_rgba(143,151,121,0.3)]">Continue Shopping</button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;