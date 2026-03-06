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

async function loadVideos() {
    const grid = document.getElementById('portfolioGrid');
    const loading = document.getElementById('loadingState');
    
    try {
        const q = query(collection(db, "videos"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        
        if (loading) loading.style.display = 'none';
        grid.innerHTML = '<div class="grid-sizer"></div>'; 

        snapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement('div');

            const orientation = data.orientation || 'landscape';
            
            card.className = `portfolio-item ${orientation}`;
            card.setAttribute('data-category', data.category ? data.category.toLowerCase() : 'various');

            const thumbUrl = data.coverUrl || `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`;

            let tagsHTML = '';
                    if(data.tags) { 
                       const customTags = data.tags.split(',').map(t => t.trim());
                       customTags.forEach(t => {
                       if(t) tagsHTML += `<span class="tag">${t}</span>`;
                    });
                    }

            card.innerHTML = `
                <div class="portfolio-item-inner">
                    <img src="${thumbUrl}" class="video-thumbnail" alt="${data.title}">
                    <div class="play-icon"><i class="fas fa-play"></i></div>
                    <div class="portfolio-overlay">
                        <h3 class="portfolio-title">${data.title}</h3>
                        <p class="portfolio-category">${data.category}</p> <div class="portfolio-tags">
                            ${tagsHTML}
                        </div>
                    </div>
                </div>
                `;

            card.onclick = () => {

            if (window.innerWidth <= 768) {
                            if (!card.classList.contains('mobile-active')) {
                                document.querySelectorAll('.portfolio-item').forEach(item => {
                                    item.classList.remove('mobile-active');
                                });

                                card.classList.add('mobile-active');

                                return; 
                            }
                        }

                document.getElementById('modalTitle').textContent = data.title;
                document.getElementById('modalClient').textContent = data.client || '-';
                document.getElementById('modalYear').textContent = data.year || '2025';
                document.getElementById('modalCat').textContent = data.category;
                document.getElementById('modalRole').textContent = data.role || '-';
                
                const videoContainer = document.getElementById('videoContainer');
            
            if (data.driveId) {
                videoContainer.innerHTML = `
                    <iframe 
                        src="https://drive.google.com/file/d/${data.driveId}/preview" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        allow="autoplay">
                    </iframe>
                `;
            } 

            else if (data.youtubeId) {
                videoContainer.innerHTML = `
                    <iframe id="youtubeVideo" 
                        src="https://www.youtube.com/embed/${data.youtubeId}?autoplay=1&rel=0" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    </iframe>
                `;
            }

            document.getElementById('modal').classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            grid.appendChild(card);
        });

        msnry = new Masonry( grid, { 
        itemSelector: '.portfolio-item',
        columnWidth: '.grid-sizer',
        percentPosition: true
    });

    imagesLoaded( grid ).on( 'progress', function() {
        msnry.layout();
    });

        setupFilter(); 

    } catch (error) {
        console.error("Error load video:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1;text-align: center; color: red;">Failed to load videos</p>';
    }
}

function setupFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('emptyState');

    filterBtns.forEach(btn => {
        btn.onclick = function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter').toLowerCase();
            const items = document.querySelectorAll('.portfolio-item');
            let visibleCount = 0;

            items.forEach(item => {
                const category = item.getAttribute('data-category');
                const itemCat = category ? category.toLowerCase() : '';
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if(msnry) msnry.layout();

            if (visibleCount === 0) emptyState.classList.add('show');
            else emptyState.classList.remove('show');
        };
    });
}

window.closeModal = () => {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('youtubeVideo').src = '';
};

loadVideos();

document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.portfolio-item')) {
            document.querySelectorAll('.portfolio-item').forEach(item => {
                item.classList.remove('mobile-active');
            });
        }
    });