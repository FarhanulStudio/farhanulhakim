
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCsi8-2A9thmiz_Uymt7bBZWaaErPy5_Cw",
    authDomain: "farhanul-studio.firebaseapp.com",
    projectId: "farhanul-studio",
    storageBucket: "farhanul-studio.firebasestorage.app",
    messagingSenderId: "720414517447",
    appId: "1:720414517447:web:698d6f69316e18992476e2",
    measurementId: "G-6BQWY0X13F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const cvBtn = document.getElementById('downloadCvBtn');

    if (cvBtn) {
        cvBtn.addEventListener('click', () => {
            gtag('event', 'download_cv', {
                'content_type': 'document',
                'file_name': 'CV_Farhanul_Hakim_2026.pdf'
            });
            console.log("Tracking Sent: CV Downloaded!"); 
        });
    }