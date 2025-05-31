// // frontend/app/test-auth/page.tsx
// "use client";
// import { useState } from 'react';
// import { useAuth } from "@/context/auth-context";
// import { AuthCheck } from "@/components/auth/auth-check";
// import { LoadingSpinner } from "@/components/ui/loading";

// interface TestItem {
//   id: number;
//   created_at: string;
//   txt: string;
// }

// export default function TestAuthPage() {
//   const { user, logout } = useAuth();
//   const [items, setItems] = useState<TestItem[]>([]);
//   const [newText, setNewText] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isFetching, setIsFetching] = useState(false);

//   const fetchItems = async () => {
//     if (isFetching) return;
    
//     setIsFetching(true);
//     setError(null);
//     try {
//       const token = await user?.getIdToken(true);
//       if (!token) {
//         throw new Error('No authentication token available');
//       }

//       const response = await fetch('http://localhost:6000/api/test', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       // Log the raw response
//       console.log('Response status:', response.status);
//       const data = await response.json();
//       console.log('Response data:', data);

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to fetch items');
//       }

//       setItems(data);
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch items');
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   const addItem = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newText.trim() || isSubmitting) return;
  
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       console.log('1. Getting token...');
//       const token = await user?.getIdToken(true);
//       if (!token) {
//         throw new Error('No authentication token available');
//       }
  
//       console.log('2. Making request...');
//       const response = await fetch('http://localhost:6000/api/test', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ txt: newText })
//       });
  
//       console.log('3. Got response:', response.status);
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to add item');
//       }
  
//       console.log('4. Success:', data);
//       setItems(prev => [...prev, data]);
//       setNewText('');
//     } catch (err) {
//       console.error('❌ Error:', err);
//       setError(err instanceof Error ? err.message : 'Failed to add item');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   return (
//     <AuthCheck>
//       <div className="p-8">
//         <h1 className="text-2xl font-bold mb-6">Test Auth Page</h1>

//         <div className="mb-6 bg-gray-100 p-4 rounded flex justify-between items-center">
//           <p>Signed in as: <span className="font-semibold">{user?.email}</span></p>
//           <button 
//             onClick={() => logout()}
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//           >
//             Sign Out
//           </button>
//         </div>
        
//         <form onSubmit={addItem} className="mb-6">
//           <input
//             type="text"
//             value={newText}
//             onChange={(e) => setNewText(e.target.value)}
//             disabled={isSubmitting}
//             className="border p-2 mr-2 rounded"
//             placeholder="Enter text"
//           />
//           <button 
//             type="submit"
//             disabled={isSubmitting || !newText.trim()}
//             className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
//               ${(isSubmitting || !newText.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {isSubmitting ? 'Adding...' : 'Add Item'}
//           </button>
//         </form>
        
//         <div className="mb-4">
//           <button
//             onClick={fetchItems}
//             disabled={isFetching}
//             className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600
//               ${isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {isFetching ? 'Fetching...' : 'Refresh Items'}
//           </button>
//         </div>
        
//         {error && (
//           <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         {isFetching ? (
//           <div className="flex justify-center p-4">
//             <LoadingSpinner />
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {items.map((item) => (
//               <div key={item.id} className="border p-4 rounded">
//                 <p>Text: {item.txt}</p>
//                 <p className="text-sm text-gray-500">
//                   Created: {new Date(item.created_at).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </AuthCheck>
//   );
// }