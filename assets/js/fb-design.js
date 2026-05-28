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

        async function loadDesigns() {
            const grid = document.getElementById('portfolioGrid');
            const empty = document.getElementById('emptyState');
            
            try {
                const q = query(collection(db, "designs"), orderBy("order", "asc"));
                const snapshot = await getDocs(q);
                
                grid.innerHTML = '<div class="grid-sizer"></div>';

                if (snapshot.empty) {
                    empty.classList.add('show');
                    return;
                }

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const card = document.createElement('div');
                    card.className = 'portfolio-item';
                    card.setAttribute('data-category', data.category);

                    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    card.setAttribute('data-slug', slug);
                    
                    const rawCover = data.coverUrl || (data.images && data.images.length > 0 ? data.images[0] : (data.imageUrl || 'https://via.placeholder.com/400'));
                    const coverImage = rawCover.replace('/upload/', '/upload/f_auto,q_auto/');

                    let tagsHTML = '';
                    if(data.tags) { 
                      const customTags = data.tags.split(',').map(t => t.trim());
                      customTags.forEach(t => {
                      if(t) tagsHTML += `<span class="tag">${t}</span>`;
                    });
                    }

                    card.innerHTML = `
                        <div class="portfolio-item-inner">
                            <img src="${rawCover}" class="portfolio-image" alt="${data.title}" loading="lazy">
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

                        document.getElementById('mTitle').textContent = data.title;

                        // === KODINGAN BUKA MODAL (Jalan pas klik ke-2 di HP, atau klik biasa di Desktop) ===
                        document.getElementById('mTitle').textContent = data.title;
                        document.getElementById('mCategory').textContent = data.category.toUpperCase();
                        document.getElementById('mDesc').textContent = data.description || '-';
                        document.getElementById('mClient').textContent = data.client || '-';
                        document.getElementById('mTools').textContent = data.tools || '-';
                        document.getElementById('mYear').textContent = data.year || '-';
                        
                        const modalImageContainer = document.getElementById('modalImagesContainer');
                        modalImageContainer.innerHTML = '';

                        if(data.images && data.images.length > 0) {
                            data.images.forEach(imgUrl => {
                                if (imgUrl === data.coverUrl) return;
                                const imgTag = document.createElement('img');
                                imgTag.src = imgUrl.replace('/upload/', '/upload/f_auto,q_auto/');
                                imgTag.alt = data.title;
                                imgTag.loading = "lazy";
                                modalImageContainer.appendChild(imgTag);
                            });
                        } else if(data.imageUrl) {
                            const imgTag = document.createElement('img');
                            imgTag.src = data.imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
                            imgTag.alt = data.title;
                            modalImageContainer.appendChild(imgTag);
                        }

                        document.getElementById('portfolioModal').classList.add('active');
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
                   targetCard.classList.add('mobile-active'); 
                   targetCard.click();
            }
        }

            } catch (err) {
                console.error("Gagal load:", err);
                grid.innerHTML = "<p style='color:red;'>Failed to load projects.</p>";
            }
        }

        function setupFilterButtons() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const category = this.getAttribute('data-filter');
                    filterDesigns(category);
                });
            });
        }

        // Filter function
        function filterDesigns(category) {
            const items = document.querySelectorAll('.portfolio-item');
            const empty = document.getElementById('emptyState');
            let found = 0;
            
            items.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'block';
                    found++;
                } else {
                    item.style.display = 'none';
                }
            });

            if(msnry) msnry.layout();
            
            if(found === 0) {
                empty.classList.add('show');
            } else {
                empty.classList.remove('show');
            }
        }

        window.closePortfolioModal = () => {
            document.getElementById('portfolioModal').classList.remove('active');
            window.history.pushState({}, '', window.location.pathname);
        };

        document.getElementById('portfolioModal').addEventListener('click', function(e) {
            if(e.target === this) {
                closePortfolioModal();
            }
        });

        loadDesigns();

        document.addEventListener('click', function(e) {
        if (!e.target.closest('.portfolio-item')) {
            document.querySelectorAll('.portfolio-item').forEach(item => {
                item.classList.remove('mobile-active');
            });
        }
    });