// // frontend/lib/api.ts
// import { getAuth } from 'firebase/auth';

// export const api = {
//   test: async () => {
//     const auth = getAuth();
//     const token = await auth.currentUser?.getIdToken();

//     const response = await fetch('http://localhost:5000/api/test', {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error('API call failed');
//     }
//     return response.json();
//   },

//   createTest: async (txt: string) => {
//     const auth = getAuth();
//     const token = await auth.currentUser?.getIdToken();

//     const response = await fetch('http://localhost:5000/api/test', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ txt })
//     });

//     if (!response.ok) {
//       throw new Error('API call failed');
//     }
//     return response.json();
//   }
// };