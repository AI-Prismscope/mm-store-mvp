import { useFridge } from '../context/FridgeContext';

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

export default function AisleBox({ title, items }) {
  const { updateFridgeQuantity, removeFridgeItem } = useFridge();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-3 border-b pb-2 text-gray-800">{title}</h3>
      {items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id} className="flex justify-between items-center text-sm">
              <span className="truncate">{item.products.name}</span>
              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                <button onClick={() => updateFridgeQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-200">-</button>
                <span className="font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateFridgeQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-200">+</button>
                <button onClick={() => removeFridgeItem(item.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 italic">Nothing here yet.</p>
      )}
    </div>
  );
} 