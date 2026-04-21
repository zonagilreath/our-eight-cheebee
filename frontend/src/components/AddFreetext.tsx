import { useState } from 'react';

interface AddFreetextProps {
  onAdd: (name: string) => void;
}

export function AddFreetext({ onAdd }: AddFreetextProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Quick add item..."
        className="flex-1 px-3 py-2.5 rounded-lg border border-8cb-border bg-white text-sm placeholder:text-8cb-text-secondary/50 focus:outline-none focus:border-8cb-red focus:ring-1 focus:ring-8cb-red"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="px-4 py-2.5 rounded-lg bg-8cb-red text-white text-sm font-medium disabled:opacity-40 hover:bg-8cb-red-dark active:scale-95 transition-all"
      >
        Add
      </button>
    </form>
  );
}
