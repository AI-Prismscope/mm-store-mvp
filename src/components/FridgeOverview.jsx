import { useMemo } from 'react';

// 👇 Let's add a new icon for "unplanned" items
const UnusedIcon = () => (
  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// A helper component to render an item with its status icon
const FridgeItem = ({ item, isPlanned }) => (
  <li className="flex items-center text-sm">
    {isPlanned ? <CheckIcon /> : <UnusedIcon />}
    <span className={`ml-2 truncate ${isPlanned ? 'text-gray-800' : 'text-gray-500'}`}>
      {item.products.name}
    </span>
  </li>
);

// A small helper component to render a list of items, to avoid repetition.
const ItemList = ({ items }) => (
  <ul className="space-y-1 text-sm">
    {items.map(item => (
      <FridgeItem key={item.id} item={item} isPlanned={item.isPlanned} />
    ))}
  </ul>
);

export default function FridgeOverview({ plannedItems = [], unplannedItems = [] }) {

  // Combine and sort the items for display, keeping track of their status
  const allFridgeItems = useMemo(() => {
    const combined = [
      ...plannedItems.map(item => ({ ...item, isPlanned: true })),
      ...unplannedItems.map(item => ({ ...item, isPlanned: false }))
    ];
    combined.sort((a, b) => a.products.name.localeCompare(b.products.name));
    return combined;
  }, [plannedItems, unplannedItems]);

  // This `useMemo` hook processes the flat list of items into our three categorized groups.
  const categorizedItems = useMemo(() => {
    // Initialize the structure for our columns
    const groups = {
      produce: [],
      proteinsAndDairy: [],
      pantry: [],
    };
    
    allFridgeItems.forEach(item => {
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
  }, [allFridgeItems]);

  const totalItems = allFridgeItems.length;
  const plannedCount = plannedItems.length;
  const unplannedCount = unplannedItems.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">Fridge & Pantry Overview</h2>
        <div className="text-sm text-gray-600">
          <span className="text-green-600 font-medium">{plannedCount} planned</span>
          {unplannedCount > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="text-gray-500">{unplannedCount} unused</span>
            </>
          )}
        </div>
      </div>
      
      {totalItems > 0 ? (
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