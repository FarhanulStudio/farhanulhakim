import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, setDoc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCsi8-2A9thmiz_Uymt7bBZWaaErPy5_Cw",
    authDomain: "farhanul-studio.firebaseapp.com",
    projectId: "farhanul-studio",
    storageBucket: "farhanul-studio.firebasestorage.app",
    messagingSenderId: "720414517447",
    appId: "1:720414517447:web:698d6f69316e18992476e2"
  };

  const CLOUD_NAME = 'di5buwg9t'; 
  const UPLOAD_PRESET = 'farhanulstudio'; 

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  let currentEditId = null; 
  let currentEditCol = ''; 

  window.showSection = (id) => {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    const activeMenu = document.querySelector(`.menu-item[onclick*="${id}"]`);
    if (activeMenu) activeMenu.classList.add('active');
  };

 // --- TARUH DI SEKITAR BARIS 1015 (DI ATAS prosesSubmit) ---
window.showSuccess = (title, msg) => {
    const modal = document.getElementById('successModal');
    if (modal) {
        document.getElementById('successTitle').innerText = title;
        document.getElementById('successMessage').innerText = msg;
        modal.classList.add('active');
    }
};

window.closeSuccessModal = () => {
    document.getElementById('successModal').classList.remove('active');
    location.reload(); 
};

  async function loadAdminData() {
    try {
      const designSnap = await getDocs(query(collection(db, "designs"), orderBy("order", "asc")));
      const photoSnap = await getDocs(query(collection(db, "photos"), orderBy("order", "asc")));
      const videoSnap = await getDocs(query(collection(db, "videos"), orderBy("order", "asc")));

      if(document.getElementById('totalDesign')) document.getElementById('totalDesign').innerText = designSnap.size;
      if(document.getElementById('totalPhotos')) document.getElementById('totalPhotos').innerText = photoSnap.size;
      if(document.getElementById('totalVideos')) document.getElementById('totalVideos').innerText = videoSnap.size;
      if(document.getElementById('totalAll')) document.getElementById('totalAll').innerText = designSnap.size + photoSnap.size + videoSnap.size;

      renderList(designSnap, 'designListContainer', 'designs');
      renderList(photoSnap, 'photoListContainer', 'photos'); 
      renderList(videoSnap, 'videoListContainer', 'videos'); 
    } catch (e) { console.error("Error Load:", e); }
  }

  function renderList(snap, containerId, col) {
    const cont = document.getElementById(containerId);
    if(!cont) return;
    cont.innerHTML = '';
    
    snap.forEach(docSnap => {
      const d = docSnap.data();
      let displayImg = 'https://via.placeholder.com/150';
      
      if(col === 'videos' && d.youtubeId) {
        displayImg = `https://img.youtube.com/vi/${d.youtubeId}/hqdefault.jpg`;
      } else {
        const photos = d.images || (d.imageUrl ? [d.imageUrl] : []);
        if(photos.length > 0) displayImg = photos[0];
      }

      const div = document.createElement('div');
      div.className = 'list-item';
      div.setAttribute('data-id', docSnap.id);
      div.innerHTML = `
        <div class="item-info" 
        style="display:flex; 
        align-items:center; 
        gap:15px;">

          <i class="fas fa-grip-vertical drag-handle" 
            style="color:#667eea; 
            cursor:grab; 
            font-size:18px;"></i>

          <img src="${displayImg}" 
            style="width:50px; 
            height:50px; 
            object-fit:cover; 
            border-radius:8px; 
            border:1px solid #333;">
          <div>

            <h4 style="margin:0; 
              font-size:14px; 
              color:#fff;">${d.title}</h4>

            <p style="margin:0; 
              font-size:12px; 
              color:#888;">${d.category}</p>
          </div>
        </div>
       <div class="item-actions">
         <button class="icon-btn edit" onclick="window.bukaEdit('${docSnap.id}', '${col}')"><i class="fas fa-edit"></i></button>
         <button class="icon-btn delete" onclick="window.hapusItem('${docSnap.id}', '${col}')"><i class="fas fa-trash"></i></button>
       </div>
       `;
       cont.appendChild(div);
    });

    // Init Sortable after rendering
    initSortable(containerId, col);
  }

  // Initialize Sortable for drag & drop reordering
  function initSortable(containerId, collection) {
    const container = document.getElementById(containerId);
    if (!container) return;

    new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: async function(evt) {
        await updateOrder(containerId, collection);
      }
    });
  }

  // Update order field in Firestore after drag & drop
  async function updateOrder(containerId, collection) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.list-item');
    const batch = writeBatch(db);

    items.forEach((item, index) => {
      const docId = item.getAttribute('data-id');
      const docRef = doc(db, collection, docId);
      batch.update(docRef, { order: index });
    });

    try {
      await batch.commit();
      console.log('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Gagal update urutan');
    }
  }

  window.bukaEdit = async (id, col) => {
    currentEditId = id;
    currentEditCol = col;
    const snap = await getDocs(collection(db, col));
    const data = snap.docs.find(d => d.id === id).data();

    if(col === 'designs') {
      document.getElementById('designTitle').value = data.title;
      document.getElementById('designCategory').value = data.category;
      document.getElementById('designDescription').value = data.description || '';
      document.getElementById('designClient').value = data.client || '';
      document.getElementById('designYear').value = data.year || '2025';
      document.getElementById('designTools').value = data.tools || '';
      document.getElementById('designTags').value = data.tags || '';
      if(data.coverUrl) {
        document.getElementById('designCoverPreview').innerHTML = 
            `<img src="${data.coverUrl}" 
              style="width:100px; 
              height:100px; 
              object-fit:cover; 
              border-radius:10px; 
              border: 2px solid #667eea;">`;
    }
      updatePreview(data.images || [data.imageUrl], 'designPreviewContainer');

      window.openModal('designModal');
    } else if(col === 'photos') {
      document.getElementById('photoTitle').value = data.title;
      document.getElementById('photoDescription').value = data.description || '';
      document.getElementById('photoCategory').value = data.category;
      document.getElementById('photoLocation').value = data.location || '';
      document.getElementById('photoClient').value = data.client || '';
      document.getElementById('photoTags').value = data.tags || '';
      document.getElementById('photoYear').value = data.year || '2025';
      document.getElementById('photoLayout').value = data.layout || 'portrait';
      if(data.coverUrl) {
        document.getElementById('photoCoverPreview').innerHTML = 
            `<img src="${data.coverUrl}" 
                style="width:100px; 
                height:100px; 
                object-fit:cover; 
                border-radius:10px; 
                border: 2px solid #667eea;">`;
    }
      updatePreview(data.images || [data.imageUrl], 'photoPreviewContainer');
      window.openModal('photoModal');

    } else if(col === 'videos') {
      document.getElementById('videoTitle').value = data.title;
      document.getElementById('videoCategory').value = data.category;
      document.getElementById('videoUrl').value = `https://www.youtube.com/watch?v=${data.youtubeId}`;
      document.getElementById('videoYear').value = data.year || '2025';
      document.getElementById('videoClient').value = data.client || '';
      document.getElementById('videoDuration').value = data.duration || '';
      document.getElementById('videoTags').value = data.tags || '';
      document.getElementById('videoOrientation').value = data.orientation || 'landscape';
      if(data.coverUrl) {
        document.getElementById('videoCoverPreview').innerHTML = 
            `<img src="${data.coverUrl}" 
              style="width:100px; 
              height:100px; 
              object-fit:cover; 
              border-radius:10px; 
              border: 2px solid #667eea;">`;
      } else {
        document.getElementById('videoCoverPreview').innerHTML = '';
      }

      if(data.driveId) {
          document.getElementById('googleDriveUrl').value = `https://drive.google.com/file/d/${data.driveId}/view?usp=sharing`;
      } else {
          document.getElementById('googleDriveUrl').value = '';
      }

      window.openModal('videoModal');
    }
  };

let itemToDelete = null;

window.hapusItem = (id, col) => {
    itemToDelete = { id, col };
    const modal = document.getElementById('deleteModal');
    modal.classList.add('active');
};

window.closeDeleteModal = () => {
    document.getElementById('deleteModal').classList.remove('active');
    itemToDelete = null;
};

document.getElementById('confirmDeleteBtn').onclick = async () => {
    if (itemToDelete) {
        const { id, col } = itemToDelete;
        const btn = document.getElementById('confirmDeleteBtn');
        btn.disabled = true;
        btn.innerText = "Processing...";
        
        try {
            await deleteDoc(doc(db, col, id));
            closeDeleteModal();
            loadAdminData(); 
        } catch (err) {
            alert("Gagal hapus: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "Hapus!";
        }
    }
};

  async function prosesSubmit(e, col, fileId) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.innerText = "Processing...";

    try {
      const pData = {
        title: e.target.querySelector('[id*="Title"]').value,
        category: e.target.querySelector('[id*="Category"]').value,
        year: e.target.querySelector('[id*="Year"]').value,
        timestamp: new Date().toISOString(),
        order: 0
      };

      if(col === 'videos') {
        const url = document.getElementById('videoUrl').value;
        const gDrive = document.getElementById('googleDriveUrl').value;

        if (!url && !gDrive) {
            alert("Woy Bos! Isi minimal salah satu Link (YouTube ATAU Google Drive). Jangan kosong dua-duanya!");
            btn.disabled = false;
            btn.innerText = "Save Video Project";
            return; 
        }

        if (url) {
            pData.youtubeId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        }
        
        if (gDrive) {
            const driveId = gDrive.split('/d/')[1]?.split('/')[0];
            if (driveId) pData.driveId = driveId;
        }
        
        pData.client = document.getElementById('videoClient').value;
        pData.duration = document.getElementById('videoDuration').value;
        pData.tags = document.getElementById('videoTags').value;
        pData.orientation = document.getElementById('videoOrientation').value;

        const coverFile = document.getElementById('videoCoverFile').files[0];
        if(coverFile) {
            const fdCover = new FormData();
            fdCover.append('file', coverFile);
            fdCover.append('upload_preset', UPLOAD_PRESET);
            const resCover = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {method:'POST', body:fdCover});
            const dCover = await resCover.json();
            pData.coverUrl = dCover.secure_url || ""; 
        }
      }

       else {
        const files = document.getElementById(fileId).files;
        if(files.length > 0) {
          let urls = [];
          for (let f of files) {
            try {
            const fd = new FormData();
            fd.append('file', f); fd.append('upload_preset', UPLOAD_PRESET);
            console.log("Sedang mengirim: " + f.name);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {method:'POST', body:fd});
            const d = await res.json();
            if(d.secure_url) {
                urls.push(d.secure_url);
            }
            } catch (err) {
                console.error("Gagal upload satu file, skip...", err);
            }
          }
          pData.images = urls;
        }
        
        if(col === 'designs') {
           const coverFile = document.getElementById('designCoverFile').files[0];
           if(coverFile) {
               const fdCover = new FormData();
               fdCover.append('file', coverFile);
               fdCover.append('upload_preset', UPLOAD_PRESET);
               const resCover = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {method:'POST', body:fdCover});
               const dCover = await resCover.json();
               pData.coverUrl = dCover.secure_url || "";
           }

          pData.description = document.getElementById('designDescription').value;
          pData.client = document.getElementById('designClient').value;
          pData.tools = document.getElementById('designTools').value;
          pData.tags = document.getElementById('designTags').value;
        }
        
        if(col === 'photos') {
            const coverFile = document.getElementById('photoCoverFile').files[0];
            if(coverFile) {
                const fdCover = new FormData();
                fdCover.append('file', coverFile);
                fdCover.append('upload_preset', UPLOAD_PRESET);
                const resCover = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {method:'POST', body:fdCover});
                const dCover = await resCover.json();
                pData.coverUrl = dCover.secure_url || ""; 
    }
    
          pData.location = document.getElementById('photoLocation').value;
          pData.description = document.getElementById('photoDescription').value;
          pData.client = document.getElementById('photoClient').value;
          pData.tags = document.getElementById('photoTags').value;
          pData.layout = document.getElementById('photoLayout').value || 'portrait';
        }
      }

     if (currentEditId) {
          await updateDoc(doc(db, col, currentEditId), pData);
          window.showSuccess("Ciee Postingan Baru", "Baru posting sekarang Bos? Kirain masih sibuk nginget masa lalu.");
      } else {
          await addDoc(collection(db, col), pData);
          window.showSuccess("Ciee Postingan Baru", "Baru posting sekarang Bos? Kirain masih sibuk nginget masa lalu.");
      }
      
    } catch (err) { 
      alert("Waduh Error: " + err.message); 
      btn.disabled = false; 
      btn.innerText = "Save Project"; 
    }
  }

  document.getElementById('designForm')?.addEventListener('submit', (e) => prosesSubmit(e, 'designs', 'designFile'));
  document.getElementById('photoForm')?.addEventListener('submit', (e) => prosesSubmit(e, 'photos', 'photoFile'));
  document.getElementById('videoForm')?.addEventListener('submit', (e) => prosesSubmit(e, 'videos', ''));

  onAuthStateChanged(auth, (user) => {
    document.getElementById('loginPage').style.display = user ? 'none' : 'flex';
    document.getElementById('dashboard').classList.toggle('active', !!user);
    if(user) { loadAdminData(); window.showSection('overview'); }
  });

  const loginF = document.getElementById('loginForm');
  if(loginF) {
    loginF.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, document.getElementById('username').value, document.getElementById('password').value);
      } catch (e) { alert("Login Gagal!"); }
    });
  }

  window.logout = () => signOut(auth);
  window.openModal = (id) => document.getElementById(id).classList.add('active');
  window.closeModal = (id) => { 
    document.getElementById(id).classList.remove('active'); currentEditId = null;
    if (id === 'designModal') {
        document.getElementById('designCoverPreview').innerHTML = '';
        document.getElementById('designPreviewContainer').innerHTML = '';
    }

    if (id === 'photoModal') {
        document.getElementById('photoCoverPreview').innerHTML = '';
        document.getElementById('photoPreviewContainer').innerHTML = '';
    }

    if (id === 'videoModal') {
        document.getElementById('videoCoverPreview').innerHTML = '';
        document.getElementById('videoForm').reset();
    }
   };

  function updatePreview(imgs, containerId) {
    const cont = document.getElementById(containerId);
    if(!cont) return; cont.innerHTML = '';
    if(imgs && imgs[0]) imgs.forEach(url => {
      const i = document.createElement('img'); 
      i.src = url; 
      i.style.cssText = "width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #333;";
      i.loading = "lazy";
      cont.appendChild(i);
    });
  }

  ['designFile', 'photoFile'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', (e) => {
      updatePreview(Array.from(e.target.files).map(f => URL.createObjectURL(f)), id === 'designFile' ? 'designPreviewContainer' : 'photoPreviewContainer');
    });
  });

document.getElementById('designCoverFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0]; 
    if(file){
        const url = URL.createObjectURL(file);
        document.getElementById('designCoverPreview').innerHTML = 
            `<img src="${url}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border: 2px solid #667eea;">`;
    }
});

document.getElementById('photoCoverFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0]; 
    if(file){
        const url = URL.createObjectURL(file);
        document.getElementById('photoCoverPreview').innerHTML = 
            `<img src="${url}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border: 2px solid #667eea;">`;
    }
});

document.getElementById('videoCoverFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0]; 
    if(file){
        const url = URL.createObjectURL(file);
        document.getElementById('videoCoverPreview').innerHTML = 
            `<img src="${url}" style="width:100px; height:100px; object-fit:cover; border-radius:10px; border: 2px solid #667eea;">`;
    }
});

window.saveProfile = async () => {
    try {
        const data = {
            name: document.getElementById('profileName').value,
            tagline: document.getElementById('profileTagline').value,
            bio: document.getElementById('profileBio').value
        };
        await setDoc(doc(db, "settings", "profile"), data, { merge: true });
        window.showSuccess("Profil Update!", "Info profil lo udah aman di database, Bos!");
    } catch (err) { alert("Gagal save profil: " + err.message); }
};

// 2. Save Social Links
window.saveSocial = async () => {
    try {
        const data = {
            instagram: document.getElementById('socialInstagram').value,
            behance: document.getElementById('socialBehance').value,
            linkedin: document.getElementById('socialLinkedin').value,
            whatsapp: document.getElementById('socialWhatsapp').value
        };
        await setDoc(doc(db, "settings", "socials"), data, { merge: true });
        window.showSuccess("Sosmed Aman!", "Link sosmed lo udah berhasil diupdate!");
    } catch (err) { alert("Gagal save sosmed: " + err.message); }
};

// 3. Save Contact Email
window.saveContact = async () => {
    try {
        const email = document.getElementById('contactEmail').value;
        await setDoc(doc(db, "settings", "contact"), { email }, { merge: true });
        window.showSuccess("Email Tersimpan!", "Sekarang orang bisa kontak lo ke email baru!");
    } catch (err) { alert("Gagal save email: " + err.message); }
};

// 4. Ganti Password Login
window.changePassword = async () => {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass !== confirmPass) return alert("Password baru gak cocok, Bos!");
    if (newPass.length < 6) return alert("Minimal 6 karakter biar aman!");

    try {
        const user = auth.currentUser;
        await updatePassword(user, newPass);
        window.showSuccess("Password Diganti!", "Inget-inget password barunya ya!");
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (err) { alert("Gagal ganti password (Mungkin butuh relogin): " + err.message); }
};

// 5. Export Data (Download JSON Backup)
window.exportData = async () => {
    try {
        const collections = ['designs', 'photos', 'videos', 'settings'];
        let allData = {};

        for (const colName of collections) {
            const snap = await getDocs(collection(db, colName));
            allData[colName] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "portfolio_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (err) { alert("Gagal export: " + err.message); }
};