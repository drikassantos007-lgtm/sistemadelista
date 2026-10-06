const firebaseConfig = {
  apiKey: "AIzaSyCkpq6h6fWUE6ebKHaMvs1mE69InjVmPJg",
  authDomain: "sistemadelista.firebaseapp.com",
  projectId: "sistemadelista",
  storageBucket: "sistemadelista.firebasestorage.app",
  messagingSenderId: "990902091636",
  appId: "1:990902091636:web:fb3e6adff34cafd5e1f621"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
