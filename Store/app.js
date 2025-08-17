// ======== CONFIG FIREBASE ========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8FfqTeGIKLC1nJtfQH8suODFdH0kXn_E",
  authDomain: "domestudios-58fa7.firebaseapp.com",
  projectId: "domestudios-58fa7",
  storageBucket: "domestudios-58fa7.appspot.com",
  messagingSenderId: "616147386743",
  appId: "1:616147386743:web:c940897c0f24aea2012172",
  measurementId: "G-5JFZJ8TC33"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ======== STORE LOGIC ========
window.fetchProducts = async function(){
  const prodCol = collection(db, "products");
  const snap = await getDocs(prodCol);
  const list = snap.docs.map(d=>({id:d.id, ...d.data()}));
  return list;
}

// ======== ADMIN LOGIC ========
window.addProduct = async function(p){
  // p = {title,type,price,desc,badge}
  try{
    const col = collection(db, "products");
    const docRef = await addDoc(col, p);
    alert(`Produit ajouté : ${p.title}`);
    return docRef.id;
  } catch(e){
    console.error(e); alert("Erreur ajout produit");
  }
}

window.deleteProduct = async function(id){
  try{
    await deleteDoc(doc(db, "products", id));
    alert("Produit supprimé");
  } catch(e){ console.error(e); alert("Erreur suppression"); }
}

// ======== AUTH ========
window.login = async function(email,password){
  try{
    await signInWithEmailAndPassword(auth,email,password);
  } catch(e){ console.error(e); alert("Login échoué") }
}

window.logout = async function(){
  try{ await signOut(auth); location.reload(); } catch(e){ alert("Erreur logout") }
}

import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-firestore.js";

window.onAuthStateChanged(auth, async (user) => {
  if (user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().role === "admin") {
      console.log("✅ Admin connecté :", user.email);
      document.body.classList.add("admin-logged");
    } else {
      console.log("❌ Pas admin :", user.email);
      document.body.classList.remove("admin-logged");
      window.location.href = "index.html"; // rediriger vers page publique
    }
  } else {
    document.body.classList.remove("admin-logged");
    window.location.href = "login.html"; // non connecté
  }
});

