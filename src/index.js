import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

const existingBooks = document.querySelector(".existing-books");
const queryData = document.querySelector(".query-data");
const updateForm = document.querySelector(".update");

const populateUpdate = ({ title, id, author }) => {
  //   console.log({ title, id, author });
  updateForm.id.value = id;
  updateForm.title.value = title;
  updateForm.author.value = author;
};

updateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const docRef = doc(db, "books", updateForm.id.value);
  updateDoc(docRef, {
    title: updateForm.title.value,
    author: updateForm.author.value,
  }).then(() => {
    updateForm.reset();
  });
});

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENTID,
};

// window.addEventListener("load", () => {
//   let h1 = document.getElementsByTagName("h1");
//   h1[0].style.color = "green";
// });

// init firebase app
initializeApp(firebaseConfig);

// init Service
const db = getFirestore();

// collection ref
const colRef = collection(db, "books");

// Auth
const auth = getAuth();

// Query Ref
const q = query(
  colRef,
  where("author", "==", "Third Author"),
  orderBy("createdAt")
);

// get collection docs
getDocs(colRef)
  .then((snapshot) => {
    let books = [];
    snapshot.docs.forEach((doc) => {
      books.push({ ...doc.data(), id: doc.id });
    });
    // console.log(books);
  })
  .catch(console.log);

//   Realtime data fetch
const unSubQ = onSnapshot(q, (snapshot) => {
  queryData.innerHTML = "";
  snapshot.docs.forEach((doc) => {
    const li = document.createElement("li");
    li.innerText = `Title: ${doc.data().title} Author:${doc.data().author}`;
    queryData.appendChild(li);
  });
});

//   Realtime query fetch
const unSubDoc = onSnapshot(colRef, (snapshot) => {
  existingBooks.innerHTML = "";
  snapshot.docs.forEach((doc) => {
    const li = document.createElement("li");
    li.innerText = `Title: ${doc.data().title} Author:${doc.data().author}`;
    li.addEventListener("click", (e) => {
      populateUpdate({
        title: doc.data().title,
        author: doc.data().author,
        id: doc.id,
      });
    });
    existingBooks.appendChild(li);
  });
});

//   Adding Documents
const addBookForm = document.querySelector(".add");
addBookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addDoc(colRef, {
    title: addBookForm.title.value,
    author: addBookForm.author.value,
    createdAt: serverTimestamp(),
  }).then(() => addBookForm.reset());
});

// Deleting Documents
const deleteBookForm = document.querySelector(".delete");
deleteBookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const docRef = doc(db, "books", deleteBookForm.id.value);
  deleteDoc(docRef).then(() => deleteBookForm.reset());
});

const docRef = doc(db, "books", "xgoh4rEfqThQkAqYj0g8");
getDoc(docRef).then((doc) => {
  //   console.log(doc.data());
});

onSnapshot(docRef, (doc) => {
  //   console.log(doc.data(), doc.id);
});

const signupForm = document.querySelector(".auth");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  createUserWithEmailAndPassword(
    auth,
    signupForm.email.value,
    signupForm.password.value
  )
    .then((cred) => {
      console.log("user Created: ", cred.user);
      signupForm.reset();
    })
    .catch((err) => {
      console.log(err);
    });
});

const loginForm = document.querySelector(".login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  signInWithEmailAndPassword(
    auth,
    loginForm.email.value,
    loginForm.password.value
  )
    .then((cred) => console.log(cred.user))
    .catch((err) => {
      console.log(err);
    });
});

const logoutForm = document.querySelector(".logout");
logoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      console.log("User Signed Out");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// Subscribing to auth changes
const unSubAuth = onAuthStateChanged(auth, (user) => {
  console.log("User State Changed", user);
});

const unSub = document.querySelector(".unsub");
unSub.addEventListener("click", (e) => {
  e.preventDefault();
  unSubAuth();
  unSubDoc();
  unSubQ();
});
