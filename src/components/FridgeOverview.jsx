import { useMemo } from 'react';

// A small helper component to render a list of items, to avoid repetition.
const ItemList = ({ items }) => (
  <ul className="space-y-1 text-sm">
    {items.map(item => (
      <li key={item.id} className="text-gray-700 truncate">
        {item.products.name}
        {/* We can add quantity display and management buttons here later */}
      </li>
    ))}
  </ul>
);

export default function FridgeOverview({ fridgeItems }) {

  // This `useMemo` hook processes the flat list of items into our three categorized groups.
  const categorizedItems = useMemo(() => {
    // Initialize the structure for our columns
    const groups = {
      produce: [],
      proteinsAndDairy: [],
      pantry: [],
    };
    
    fridgeItems.forEach(item => {
      // Find the 'aisle' tag for the product
      const aisleTag = item.products.product_tags?.find(pt => pt.tags?.type === 'aisle');
      if (aisleTag) {
        const categoryName = aisleTag.tags.name;
        // Place the item into the correct column based on its category
        if (categoryName === 'fruit' || categoryName === 'vegetables') {
          groups.produce.push(item);
        } else if (categoryName === 'meat & seafood' || categoryName === 'dairy & eggs') {
          groups.proteinsAndDairy.push(item);
        } else if (categoryName === 'pantry') {
          groups.pantry.push(item);
        }
      }
    });

    // Sort each list alphabetically for a stable display order
    for (const key in groups) {
      groups[key].sort((a, b) => a.products.name.localeCompare(b.products.name));
    }

    return groups;
  }, [fridgeItems]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-3 text-gray-800">Fridge & Pantry Overview</h2>
      
      {fridgeItems.length > 0 ? (
        // This is our new 3-column grid layout
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          
          {/* Column 1: Produce */}
          <div>
            <h3 className="font-semibold text-green-700 mb-2">
              Produce ({categorizedItems.produce.length})
            </h3>
            <ItemList items={categorizedItems.produce} />
          </div>

          {/* Column 2: Proteins & Dairy */}
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">
              Proteins & Dairy ({categorizedItems.proteinsAndDairy.length})
            </h3>
            <ItemList items={categorizedItems.proteinsAndDairy} />
          </div>

          {/* Column 3: Pantry */}
          <div>
            <h3 className="font-semibold text-yellow-700 mb-2">
              Pantry ({categorizedItems.pantry.length})
            </h3>
            <ItemList items={categorizedItems.pantry} />
          </div>

        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Your fridge is empty.</p>
          <p className="text-gray-500 mt-1">Use the search on the left to add items you have at home.</p>
        </div>
      )}
    </div>
  );
} 