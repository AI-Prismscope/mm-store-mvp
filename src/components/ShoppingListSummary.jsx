export default function ShoppingListSummary({ cartItems, assignedItems, unassignedItems }) {
  // A small helper component to avoid repeating the list rendering logic
  const ItemList = ({ items }) => (
    <ul className="space-y-1 text-sm">
      {items.map(item => (
        <li key={item.id} className="text-gray-600 truncate">
          {item.quantity} x {item.products.name}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4 border-b pb-3">Shopping List Overview</h2>
      {/* Always use 3 columns */}
      <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
        {/* Column 1: All Items in Cart */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Total Cart ({cartItems.length})
          </h3>
          {cartItems.length > 0 ? (
            <ItemList items={cartItems} />
          ) : (
             <p className="text-sm text-gray-400 italic">Your cart is empty.</p>
          )}
        </div>
        {/* Column 2: Assigned Items */}
        <div>
          <h3 className="font-semibold text-green-700 mb-2">
            Planned Items ({assignedItems.length})
          </h3>
          {assignedItems.length > 0 ? (
            <ItemList items={assignedItems} />
          ) : (
            <p className="text-sm text-gray-400 italic">No items assigned to a recipe yet.</p>
          )}
        </div>
        {/* Column 3: Unassigned Items */}
        <div>
          <h3 className="font-semibold text-red-700 mb-2">
            Available Items ({unassignedItems.length})
          </h3>
          {unassignedItems.length > 0 ? (
            <ItemList items={unassignedItems} />
          ) : (
            <p className="text-sm text-gray-400 italic">No extra items in your cart.</p>
          )}
        </div>
      </div>
    </div>
  );
} 