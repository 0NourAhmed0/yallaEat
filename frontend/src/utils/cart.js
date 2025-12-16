const KEY = "yallaeat_cart";

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => localStorage.setItem(KEY, JSON.stringify(cart));

export const addItem = (item) => {
  const cart = getCart();
  const found = cart.find((x) => x.id === item.id);

  if (found) found.qty += 1;
  else cart.push({ ...item, qty: 1 });

  saveCart(cart);
  return cart;
};

export const removeItem = (id) => {
  const cart = getCart().filter((x) => x.id !== id);
  saveCart(cart);
  return cart;
};

export const updateQty = (id, qty) => {
  const cart = getCart().map((x) => (x.id === id ? { ...x, qty } : x));
  saveCart(cart);
  return cart;
};

export const clearCart = () => saveCart([]);
