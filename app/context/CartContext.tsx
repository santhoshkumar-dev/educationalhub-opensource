"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useReducer,
} from "react";
import { useUser } from "@clerk/nextjs";

interface CartItem {
  _id: string;
  course_name: string;
  course_image: string;
  price: number;
  discountedPrice?: number;
  slug: string;
  instructors?: Array<{
    first_name: string;
    last_name: string;
  }>;
  organization?: {
    name: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "UPDATE_TOTAL" };

const initialState: CartState = {
  items: [],
  total: 0,
  isLoading: false,
};

const getEffectivePrice = (item: CartItem): number => {
  return item.discountedPrice && item.discountedPrice > 0
    ? item.discountedPrice
    : item.price;
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_CART":
      const total = action.payload.reduce(
        (sum, item) => sum + getEffectivePrice(item),
        0,
      );
      return { ...state, items: action.payload, total };

    case "ADD_ITEM":
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id,
      );
      if (existingItem) return state;

      const newItems = [...state.items, action.payload];
      const newTotal = newItems.reduce(
        (sum, item) => sum + getEffectivePrice(item),
        0,
      );
      return { ...state, items: newItems, total: newTotal };

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(
        (item) => item._id !== action.payload,
      );
      const updatedTotal = filteredItems.reduce(
        (sum, item) => sum + getEffectivePrice(item),
        0,
      );
      return { ...state, items: filteredItems, total: updatedTotal };

    case "CLEAR_CART":
      return { ...state, items: [], total: 0 };

    case "UPDATE_TOTAL":
      const recalculatedTotal = state.items.reduce(
        (sum, item) => sum + getEffectivePrice(item),
        0,
      );
      return { ...state, total: recalculatedTotal };

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (itemId: string) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useUser();

  const refreshCart = useCallback(async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_CART", payload: data.items || [] });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user, dispatch]);

  // Load cart from localStorage or API
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Load from localStorage for non-authenticated users
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: "SET_CART", payload: cartItems });
        } catch (error) {
          console.error("Error loading cart from localStorage:", error);
        }
      }
    }
  }, [user, refreshCart, dispatch]);

  // Save to localStorage when cart changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const addToCart = async (item: CartItem) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      if (user) {
        const response = await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId: item._id }),
        });

        if (response.ok) {
          dispatch({ type: "ADD_ITEM", payload: item });
        }
      } else {
        dispatch({ type: "ADD_ITEM", payload: item });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const removeFromCart = async (itemId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      if (user) {
        const response = await fetch("/api/cart/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId: itemId }),
        });

        if (response.ok) {
          dispatch({ type: "REMOVE_ITEM", payload: itemId });
        }
      } else {
        dispatch({ type: "REMOVE_ITEM", payload: itemId });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearCart = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      if (user) {
        const response = await fetch("/api/cart/clear", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          dispatch({ type: "CLEAR_CART" });
        }
      } else {
        dispatch({ type: "CLEAR_CART" });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const isInCart = (itemId: string) => {
    return state.items.some((item) => item._id === itemId);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
