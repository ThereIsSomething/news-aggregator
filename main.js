
const API_KEY = 'ad85e3f66a074ce5ba7c4b0a8ed434c3';
const BASE_URL = 'https://newsapi.org/v2';

let currentCategory = 'top';
let currentArticles = [];
let savedArticles = JSON.parse(localStorage.getItem('savedArticles')) || [];


document.addEventListener('DOMContentLoaded', () => {
    fetchNews(currentCategory);
    renderSavedArticles();

    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelector('.category-btn.active').classList.remove('active');
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            fetchNews(currentCategory);
        });
    });
});

async function fetchNews(category) {
    try {
        const endpoint = category === 'top' ? 'top-headlines' : 'everything';
        const params = category === 'top'
            ? 'country=us'
            : `q=${category}&language=en`;

        const url = `${BASE_URL}/${endpoint}?${params}&apiKey=${API_KEY}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (!data.articles) throw new Error('No articles found');

        currentArticles = data.articles;
        renderNews(currentArticles);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        document.getElementById('newsContainer').innerHTML = `
            <p class="error">Failed to load news. Please try again later.</p>`;
    }
}

function renderNews(articles) {
    const newsContainer = document.getElementById('newsContainer');
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = '<p class="error">No news articles found.</p>';
        return;
    }

    newsContainer.innerHTML = articles.map(article => `
        <article class="news-card">
            <img class="news-image" 
                src="${article.urlToImage || 'https://picsum.photos/400/300'}" 
                alt="${article.title}"
                onerror="this.src='https://picsum.photos/400/300'"
            >
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || 'No description available'}</p>
                <div class="news-meta">
                    <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more-btn">Read More</a>
                    <button class="save-btn" onclick="saveArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                        ${isArticleSaved(article) ? 'Unsave' : 'Save'}
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

function saveArticle(article) {
    const index = savedArticles.findIndex(saved => saved.title === article.title);

    if (index === -1) {
        savedArticles.push(article);
    } else {
        savedArticles.splice(index, 1);
    }

    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    renderSavedArticles();
    renderNews(currentArticles);
}

function isArticleSaved(article) {
    return savedArticles.some(saved => saved.title === article.title);
}

function renderSavedArticles() {
    const savedList = document.getElementById('savedArticlesList');
    savedList.innerHTML = savedArticles.map(article => `
        <div class="saved-article">
            <h4>${article.title}</h4>
            <small>${new Date(article.publishedAt).toLocaleDateString()}</small>
            <div class="saved-article-actions">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more-btn">Read</a>
                <button class="save-btn" onclick="saveArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}
