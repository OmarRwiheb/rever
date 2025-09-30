'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function CustomerNotes({ onNoteChange }) {
  const { cart, loading } = useCart();
  const [note, setNote] = useState('');

  // Initialize note from cart
  useEffect(() => {
    if (cart?.note) {
      setNote(cart.note);
    }
  }, [cart?.note]);

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    // Call the parent callback if provided
    if (onNoteChange) {
      onNoteChange(newNote);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="customer-note" className="block text-sm font-montserrat-bold text-gray-900">
        Customer Notes (Optional)
      </label>
      <textarea
        id="customer-note"
        value={note}
        onChange={handleNoteChange}
        placeholder="Add any special instructions or notes for your order..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none resize-none text-sm font-montserrat-regular text-gray-900 placeholder-gray-500"
        disabled={loading}
      />
      <p className="text-xs font-montserrat-regular text-gray-600">
        Your note will be saved when you proceed to checkout
      </p>
    </div>
  );
}
