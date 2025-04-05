// // frontend/lib/api.ts
// import { getAuth } from 'firebase/auth';

// export const api = {
//   test: async () => {
//     const auth = getAuth();
//     const token = await auth.currentUser?.getIdToken();

<<<<<<< HEAD
    const response = await fetch('http://localhost:6000/api/test', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
=======
//     const response = await fetch('http://localhost:5000/api/test', {
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     });
>>>>>>> 55d5fece985f432a06f69f844fa2af13c8128658

//     if (!response.ok) {
//       throw new Error('API call failed');
//     }
//     return response.json();
//   },

//   createTest: async (txt: string) => {
//     const auth = getAuth();
//     const token = await auth.currentUser?.getIdToken();

<<<<<<< HEAD
    const response = await fetch('http://localhost:6000/api/test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txt })
    });
=======
//     const response = await fetch('http://localhost:5000/api/test', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ txt })
//     });
>>>>>>> 55d5fece985f432a06f69f844fa2af13c8128658

//     if (!response.ok) {
//       throw new Error('API call failed');
//     }
//     return response.json();
//   }
// };