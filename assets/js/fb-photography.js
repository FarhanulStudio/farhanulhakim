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

    let msnry;

    async function loadPhotos() {
        const grid = document.getElementById('portfolioGrid');
        const empty = document.getElementById('emptyState');
        const loading = document.getElementById('loadingState');
        
        try {
            const q = query(collection(db, "photos"), orderBy("order", "asc"));
            const snapshot = await getDocs(q);
            
            if(loading) loading.style.display = 'none';
            
            grid.innerHTML = '<div class="grid-sizer"></div>';

            if (snapshot.empty) {
                empty.classList.add('show');
                return;
            }

            snapshot.forEach((doc) => {
                const data = doc.data();
                const card = document.createElement('div');

                card.className = `portfolio-item ${data.layout || 'portrait'}`;
                card.setAttribute('data-category', data.category);

                const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                card.setAttribute('data-slug', slug);
                
                const coverImage = data.coverUrl || (data.images && data.images.length > 0 ? data.images[0] : 'https://via.placeholder.com/400');

                let tagsHTML = '';
                if(data.tags) {
                    const tList = data.tags.split(',').map(t => t.trim());
                    tList.forEach(tag => { if(tag) tagsHTML += `<span class="tag">${tag}</span>`; });
                }

                card.innerHTML = `
                    <div class="portfolio-item-inner">
                        <img src="${coverImage}" class="photo-thumbnail">
                        <div class="portfolio-overlay">
                            <h3 class="portfolio-title">${data.title}</h3>
                            <p class="portfolio-category">${data.category}</p>
                            <div class="portfolio-tags">${tagsHTML}</div>
                        </div>
                    </div>
                `;

                card.onclick = (e) => {
                        if (window.innerWidth <= 768) {
                            if (!card.classList.contains('mobile-active')) {
                                document.querySelectorAll('.portfolio-item').forEach(item => {
                                    item.classList.remove('mobile-active');
                                });

                                card.classList.add('mobile-active');

                                return; 
                            }
                        }

                        window.history.pushState({slug: slug}, '', '?project=' + slug);
                        openDynamicGallery(data);
            };

                grid.appendChild(card);
            });

            msnry = new Masonry(grid, {
                itemSelector: '.portfolio-item',
                columnWidth: '.grid-sizer',
                percentPosition: true
            });

            imagesLoaded(grid).on('progress', function() {
                msnry.layout();
            });

            setupFilterButtons();

            const urlParams = new URLSearchParams(window.location.search);
            const projectSlug = urlParams.get('project');

            if(projectSlug) {
                const targetCard = document.querySelector(`.portfolio-item[data-slug="${projectSlug}"]`);
                if(targetCard) {
                    // Biar langsung kebuka di HP juga (ngelewatin mode hover)
                    targetCard.classList.add('mobile-active'); 
                    targetCard.click();
                }
            }

        } catch (err) {
            console.error("Gagal load photos:", err);
            grid.innerHTML = "<p style='color:red; text-align:center;'>Gagal memuat foto euy.</p>";
        }
    }

    function setupFilterButtons() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const items = document.querySelectorAll('.portfolio-item');
        const empty = document.getElementById('emptyState');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                let found = 0;
                
                items.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        found++;
                    } else {
                        item.style.display = 'none';
                    }
                });

                if(msnry) msnry.layout();
                
                if(found === 0) empty.classList.add('show');
                else empty.classList.remove('show');
            });
        });
    }

    window.openDynamicGallery = (data) => {
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDescription').textContent = data.description || '';
        document.getElementById('modalClient').textContent = data.client || '-';
        document.getElementById('modalYear').textContent = data.year || '-';
        document.getElementById('modalCat').textContent = data.category;
        document.getElementById('modalLocation').textContent = data.location || '-';

        const galleryContainer = document.getElementById('photoGallery');
        galleryContainer.innerHTML = '';

        if(data.images && data.images.length > 0) {
            data.images.forEach(imgUrl => {
                const imgTag = document.createElement('img');
                imgTag.className = 'gallery-image';
                imgTag.src = imgUrl;
                imgTag.alt = data.title;
                imgTag.onclick = () => openLightbox(imgUrl);   
                galleryContainer.appendChild(imgTag);
            });
        }

        document.getElementById('modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeGallery = () => {
        document.getElementById('modal').classList.remove('active');
        document.body.style.overflow = 'auto';
        window.history.pushState({}, '', window.location.pathname);
    };

    window.openLightbox = (imageUrl) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
    
        lightboxImage.src = imageUrl;
        lightbox.classList.add('active');
    };

    window.closeLightbox = () => {
        document.getElementById('lightbox').classList.remove('active');
    };

    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) closeGallery();
    });

    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) closeLightbox();
    });

    // LOAD DATA
    loadPhotos();