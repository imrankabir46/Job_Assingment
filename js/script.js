function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}


let currentPage = 1;
const booksPerPage = 10;
let allBooks = [];
let currentSearchQuery = '';
let currentGenre = '';

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];


async function fetchBooks(page = 1) {
    showLoader(); 
    try {
        const response = await fetch(`https://gutendex.com/books/?page=${page}`);
        const data = await response.json();
        allBooks = data.results;
        renderBooks(allBooks);
        updatePaginationInfo(page);
    } catch (error) {
        console.error('Error fetching books:', error);
    } finally {
        hideLoader(); 
    }
}


function renderBooks(books) {
    const bookList = document.getElementById('book-list');
    if (!bookList) return; 

    bookList.innerHTML = '';

    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <img class="book-cover" src="${book.formats['image/jpeg']}" alt="${book.title}">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><b>Author:</b> ${book.authors[0]?.name || 'Unknown'}</p>
            <p class="book-genre"><b>Genre: </b>${book.subjects[0] || 'Unknown'}</p>
            <a href="book.html?id=${book.id}" class="view-details">View Details</a>
            <button class="wishlist-button" onclick="toggleWishlist(${book.id})">
                ${wishlist.includes(book.id) ? '❤️' : '🤍'}
            </button>
        `;
        bookList.appendChild(bookItem);
    });
}


function updatePaginationInfo(page) {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.textContent = `Page ${page}`;
    }
}


const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', function () {
        currentSearchQuery = this.value.toLowerCase();
        filterBooks();
    });
}


const genreFilter = document.getElementById('genre-filter');
if (genreFilter) {
    genreFilter.addEventListener('change', function () {
        currentGenre = this.value;
        filterBooks();
    });
}



function filterBooks() {
    showLoader(); 

    
    const filteredBooks = allBooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(currentSearchQuery);
        const matchesGenre = currentGenre === '' || book.subjects.some(subject => subject.includes(currentGenre));
        return matchesSearch && matchesGenre;
    });

    renderBooks(filteredBooks);
    hideLoader(); 
}


const prevPageBtn = document.getElementById('prev-page');
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchBooks(currentPage);
        }
    });
}

const nextPageBtn = document.getElementById('next-page');
if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        fetchBooks(currentPage);
    });
}


function toggleWishlist(bookId) {
    showLoader(); 
    if (wishlist.includes(bookId)) {
        wishlist = wishlist.filter(id => id !== bookId);
    } else {
        wishlist.push(bookId);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderBooks(allBooks);
    hideLoader(); 
}


async function loadWishlist() {
    showLoader(); 

    
    if (allBooks.length === 0) {
        try {
            const response = await fetch('https://gutendex.com/books');
            const data = await response.json();
            allBooks = data.results;
        } catch (error) {
            console.error('Error fetching books for wishlist:', error);
            hideLoader();
            return;
        }
    }

    const wishlistBooks = allBooks.filter(book => wishlist.includes(book.id));
    const wishlistContainer = document.getElementById('wishlist-books');
    if (!wishlistContainer) {
        hideLoader(); 
        return;
    }

    wishlistContainer.innerHTML = '';

    wishlistBooks.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <img class="book-cover" src="${book.formats['image/jpeg']}" alt="${book.title}">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><b>Author:</b> ${book.authors[0]?.name || 'Unknown'}</p>
            <p class="book-genre"><b>Genre: </b>${book.subjects[0] || 'Unknown'}</p>
            <a href="book.html?id=${book.id}" class="view-details">View Details</a>
             <button onclick="toggleWishlist(${book.id})">❤️</button>
        `;
        wishlistContainer.appendChild(bookItem);
    });

    hideLoader(); 
}



function loadBookDetails() {
    showLoader(); 
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        fetch(`https://gutendex.com/books/${bookId}`)
            .then(response => response.json())
            .then(book => {
                const bookDetails = document.getElementById('book-details');
                if (!bookDetails) return; 

                bookDetails.innerHTML = `
                    <img  src="${book.formats['image/jpeg']}" alt="${book.title}">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author"><b>Author:</b> ${book.authors[0]?.name || 'Unknown'}</p>
                    <p class="book-genre"><b>Genre: </b>${book.subjects[0] || 'Unknown'}</p>
                    <p>Download: <a href="${book.formats['application/octet-stream']}" target="_blank">Text</a></p>
                `;
            })
            .catch(error => console.error('Error loading book details:', error))
            .finally(() => hideLoader()); 
    }
}


if (document.getElementById('book-list')) {
    fetchBooks();
} else if (document.getElementById('wishlist-books')) {
    loadWishlist();
} else if (document.getElementById('book-details')) {
    loadBookDetails();
}
