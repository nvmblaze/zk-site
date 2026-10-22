let verifiedGoogleReviews = [];

const reviewGrid = document.querySelector('#review-grid');
const reviewEmpty = document.querySelector('#review-empty');
const reviewLoadMore = document.querySelector('#review-load-more');
const reviewSummaryStars = document.querySelector('#review-summary-stars');
const reviewAverage = document.querySelector('#review-average');
const reviewCount = document.querySelector('#review-count');
const reviewForm = document.querySelector('#review-form');
const reviewSubmit = document.querySelector('#review-submit');
const reviewFormStatus = document.querySelector('#review-form-status');
const reviewsPerPage = 6;
let submittedReviews = [];
let visibleReviewCount = reviewsPerPage;

function makeReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card';

  const top = document.createElement('div');
  top.className = 'review-card-top';

  const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
  const source = document.createElement('span');
  source.className = 'review-source';
  source.textContent = review.source || 'Website review';
  if (rating > 0) {
    const stars = document.createElement('span');
    stars.className = 'review-card-stars';
    stars.textContent = `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}`;
    stars.setAttribute('aria-label', `${rating} out of 5 stars`);
    top.append(stars, source);
  } else {
    top.append(source);
  }

  const quote = document.createElement('blockquote');
  quote.textContent = review.text;

  const attribution = document.createElement('div');
  attribution.className = 'review-attribution';
  const name = document.createElement('strong');
  name.textContent = review.name || 'Anonymous';
  attribution.append(name);

  if (review.date) {
    const date = document.createElement('span');
    date.textContent = review.date;
    attribution.append(date);
  }

  card.append(top, quote, attribution);
  return card;
}

function renderReviews() {
  if (!reviewGrid) return;

  const allReviews = [...verifiedGoogleReviews, ...submittedReviews];
  const validReviews = allReviews.filter((review) => review.text);
  const ratedReviews = validReviews.filter((review) => Number.isInteger(Number(review.rating)) && Number(review.rating) >= 1 && Number(review.rating) <= 5);
  const average = ratedReviews.reduce((total, review) => total + Number(review.rating), 0) / (ratedReviews.length || 1);
  const roundedStars = Math.round(average);

  if (reviewSummaryStars && ratedReviews.length) {
    reviewSummaryStars.textContent = `${'★'.repeat(roundedStars)}${'☆'.repeat(5 - roundedStars)}`;
    reviewSummaryStars.setAttribute('aria-label', `${average.toFixed(1)} out of 5 from ${ratedReviews.length} rated reviews`);
    reviewSummaryStars.classList.add('has-rating');
  }
  if (reviewAverage && ratedReviews.length) reviewAverage.textContent = `${average.toFixed(1)} / 5`;
  if (reviewCount && validReviews.length) {
    reviewCount.textContent = ratedReviews.length === validReviews.length
      ? `Based on ${validReviews.length} reviews`
      : ratedReviews.length
        ? `Based on ${ratedReviews.length} rated review${ratedReviews.length === 1 ? '' : 's'} · ${validReviews.length} reviews published`
        : `${validReviews.length} reviews published`;
  }
  if (reviewEmpty) reviewEmpty.hidden = validReviews.length > 0;

  reviewGrid.replaceChildren(...validReviews.slice(0, visibleReviewCount).map(makeReviewCard));

  if (reviewLoadMore) {
    const hasMore = visibleReviewCount < validReviews.length;
    reviewLoadMore.hidden = !hasMore;
    reviewLoadMore.onclick = () => {
      visibleReviewCount = Math.min(visibleReviewCount + reviewsPerPage, validReviews.length);
      renderReviews();
    };
  }
}

async function loadSubmittedReviews() {
  try {
    const response = await fetch('/api/reviews', { cache: 'no-store' });
    if (!response.ok) throw new Error('Review storage is not connected.');
    const result = await response.json();
    submittedReviews = Array.isArray(result.reviews) ? result.reviews : [];
    if (reviewSubmit) reviewSubmit.disabled = false;
    if (reviewFormStatus) reviewFormStatus.textContent = 'Your review will appear on the site after you post it.';
  } catch {
    if (reviewSubmit) reviewSubmit.disabled = true;
    if (reviewFormStatus) reviewFormStatus.textContent = 'Review posting is not connected yet. Please call the academy to share feedback.';
  }
  renderReviews();
}

async function loadGoogleReviews() {
  try {
    const response = await fetch('/assets/google-reviews.json');
    if (!response.ok) throw new Error('Google review data could not be loaded.');
    const data = await response.json();
    verifiedGoogleReviews = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(error);
  }
  renderReviews();
}

if (reviewForm) {
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!reviewSubmit || reviewSubmit.disabled) return;

    const formData = new FormData(reviewForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      rating: Number(formData.get('rating')),
      text: String(formData.get('text') || '').trim(),
      website: String(formData.get('website') || '').trim(),
    };

    reviewSubmit.disabled = true;
    if (reviewFormStatus) reviewFormStatus.textContent = 'Posting your review…';

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not post the review. Please try again.');

      if (result.review) submittedReviews.unshift(result.review);
      visibleReviewCount = Math.max(visibleReviewCount, reviewsPerPage);
      reviewForm.reset();
      renderReviews();
      if (reviewFormStatus) reviewFormStatus.textContent = 'Thank you. Your review has been posted.';
    } catch (error) {
      if (reviewFormStatus) reviewFormStatus.textContent = error.message;
    } finally {
      reviewSubmit.disabled = false;
    }
  });
}

renderReviews();
loadGoogleReviews();
loadSubmittedReviews();
