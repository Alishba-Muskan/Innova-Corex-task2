const upload = document.getElementById('upload');
const dropArea = document.getElementById('drop-area');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const closeBtn = document.querySelector('.close');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
let currentIndex = 0;

function saveToLocal() {
    localStorage.setItem('galleryImages', JSON.stringify(images));
}

function removeCenterClass() {
    document.body.classList.remove('center-screen');
}

function renderGallery() {
    gallery.innerHTML = ''; // Clear current gallery before rendering new one
    if (images.length > 0) {
        removeCenterClass();
    }

    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('draggable', 'true');
        card.dataset.index = index;

        const image = document.createElement('img');
        image.src = img.src;
        image.alt = 'Gallery Image';
        image.addEventListener('click', () => openModal(index));

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerText = '✖';
        delBtn.addEventListener('click', () => {
            images.splice(index, 1);
            saveToLocal();
            renderGallery();
        });

        // Caption with default text as 'Add caption...' if not present
        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.contentEditable = true;
        caption.innerText = img.caption || 'Add caption...';

        caption.addEventListener('focus', () => {
            if (caption.innerText === 'Add caption...') {
                caption.innerText = ''; // Clear the default placeholder when editing starts
            }
        });

        caption.addEventListener('blur', () => {
            if (caption.innerText.trim() === '') {
                caption.innerText = 'Add caption...'; // Reset to placeholder if left empty
            }
            images[index].caption = caption.innerText; // Save caption to image data
            saveToLocal();
        });

        card.appendChild(image);
        card.appendChild(delBtn);
        card.appendChild(caption);

        addDragEvents(card);
        gallery.appendChild(card);
    });
}

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.background = '#333';
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.background = '#222';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.background = '#222';
    const files = [...e.dataTransfer.files];
    removeCenterClass();

    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            images.push({ src: event.target.result, caption: '' });
            saveToLocal();
            renderGallery();
        };
        reader.readAsDataURL(file);
    });
});

upload.addEventListener('change', (e) => {
    removeCenterClass();
    [...e.target.files].forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            images.push({ src: event.target.result, caption: '' });
            saveToLocal();
            renderGallery();
        };
        reader.readAsDataURL(file);
    });
});

function addDragEvents(card) {
    card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        const updatedOrder = [...gallery.children].map(child => {
            const idx = child.dataset.index;
            return images[idx];
        });
        images = updatedOrder;
        saveToLocal();
        renderGallery();
    });
}

gallery.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(e.clientY);
    if (afterElement == null) {
        gallery.appendChild(dragging);
    } else {
        gallery.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(y) {
    const cards = [...gallery.querySelectorAll('.card:not(.dragging)')];
    return cards.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function openModal(index) {
    currentIndex = index;
    modal.style.display = 'flex';
    modalImg.src = images[index].src;
}

function closeModal() {
    modal.style.display = 'none';
}

function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    modalImg.src = images[currentIndex].src;
}

function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentIndex].src;
}

closeBtn.addEventListener('click', closeModal);
nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    }
});

renderGallery();
