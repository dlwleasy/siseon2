// 데이터 저장소
let dailyPosts = [
  {
    id: 1,
    author: "사용자1",
    title: "어느 저녁 종료하고, 동네 창문 산책중에요~",
    content:
      "우리집 근처 카페에서 아메리카노 한잔하는 걸 목표로 했었는데, 오늘 했습니다!",
    likes: 12,
    commentCount: 6,
    comments: [
      { author: "사용자2", text: "좋아 보이네요!", date: "5분 전" },
      { author: "사용자3", text: "감사합니다!", date: "3분 전" },
    ],
  },
  {
    id: 2,
    author: "사용자2",
    title: "오늘 치킨 무야기 먹었다!",
    content:
      "너무 맛있 지차 사람들이랑 같이 먹은 건 오프라인 매장이었어요 (기분최고!)",
    likes: 25,
    commentCount: 8,
    comments: [],
  },
];

let reviewPosts = [
  {
    id: 1,
    author: "행복한우리집",
    title:
      "망 좋은 보면! 가을 장기 보고 올랐어요~!! 실제로 올라갈수있다면 너무 좋아 거예요~!",
    rating: 5,
    images: [
      "https://via.placeholder.com/300x300/ff6b6b/fff",
      "https://via.placeholder.com/300x300/4ecdc4/fff",
    ],
    likes: 12,
    commentCount: 0,
    comments: [],
  },
];

let currentPostId = null;
let currentTab = "daily";
let selectedRating = 0;
let uploadedImages = [];

// 탭 전환
const tabs = document.querySelectorAll(".tab");
const dailyContent = document.getElementById("daily-content");
const reviewContent = document.getElementById("review-content");
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    currentTab = tab.dataset.tab;
    if (currentTab === "daily") {
      dailyContent.classList.remove("hidden");
      reviewContent.classList.add("hidden");
      heroTitle.textContent = "시선으로 이야기는";
      heroSubtitle.textContent = "우리의 일상 이야기";
    } else {
      dailyContent.classList.add("hidden");
      reviewContent.classList.remove("hidden");
      heroTitle.textContent = "당신의 한 줄 후기";
      heroSubtitle.textContent = "누군가에게 새로운 시선이 됩니다";
    }
  });
});

// 별점 선택
const stars = document.querySelectorAll("#starRating .star");
stars.forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = parseInt(star.dataset.rating);
    updateStarDisplay();
  });
});

function updateStarDisplay() {
  stars.forEach((star, index) => {
    if (index < selectedRating) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

// 이미지 업로드
document.getElementById("reviewImages").addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  const preview = document.getElementById("imagePreview");

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.push(e.target.result);
      renderImagePreview();
    };
    reader.readAsDataURL(file);
  });
});

function renderImagePreview() {
  const preview = document.getElementById("imagePreview");
  preview.innerHTML = uploadedImages
    .map(
      (img, index) => `
          <div class="preview-item">
            <img src="${img}" alt="Preview ${index + 1}" />
            <button type="button" class="remove-img" onclick="removeImage(${index})">×</button>
          </div>
        `
    )
    .join("");
}

function removeImage(index) {
  uploadedImages.splice(index, 1);
  renderImagePreview();
}

// 일상 게시글 작성
document.getElementById("dailyForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("dailyTitle").value;
  const content = document.getElementById("dailyContent").value;

  const newPost = {
    id: dailyPosts.length + 1,
    author: "새 사용자",
    title,
    content,
    likes: 0,
    commentCount: 0,
    comments: [],
  };

  dailyPosts.unshift(newPost);
  renderDailyPosts();
  e.target.reset();
});

// 후기 게시글 작성
document.getElementById("reviewForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("reviewTitle").value;

  if (selectedRating === 0) {
    alert("별점을 선택해주세요!");
    return;
  }

  const newPost = {
    id: reviewPosts.length + 1,
    author: "새 사용자",
    title,
    rating: selectedRating,
    images: [...uploadedImages],
    likes: 0,
    commentCount: 0,
    comments: [],
  };

  reviewPosts.unshift(newPost);
  renderReviewPosts();
  e.target.reset();
  selectedRating = 0;
  uploadedImages = [];
  updateStarDisplay();
  renderImagePreview();
});

// 일상 게시글 렌더링
function renderDailyPosts() {
  const list = document.getElementById("dailyList");
  list.innerHTML = dailyPosts
    .map(
      (post) => `
          <div class="post-item" data-id="${post.id}" onclick="openCommentModal(${post.id}, 'daily')">
            <div class="post-header">
              <span class="post-badge">${post.author}</span>
              <div class="post-actions" onclick="event.stopPropagation()">
                <button class="edit-btn" onclick="editPost(${post.id}, 'daily')">수정</button>
                <button class="delete-btn" onclick="deletePost(${post.id}, 'daily')">삭제</button>
              </div>
            </div>
            <div class="post-title">${post.title}</div>
            <div class="post-content">${post.content}</div>
            <div class="post-meta">
              <span>👍 ${post.likes}개</span>
              <span>💬 ${post.commentCount}개</span>
            </div>
          </div>
        `
    )
    .join("");
}

// 후기 게시글 렌더링
function renderReviewPosts() {
  const list = document.getElementById("reviewList");
  list.innerHTML = reviewPosts
    .map(
      (post) => `
          <div class="post-item" data-id="${
            post.id
          }" onclick="openCommentModal(${post.id}, 'review')">
            <div class="post-header">
              <span class="post-badge">${post.author}</span>
              <div class="post-actions" onclick="event.stopPropagation()">
                <button class="edit-btn" onclick="editPost(${
                  post.id
                }, 'review')">수정</button>
                <button class="delete-btn" onclick="deletePost(${
                  post.id
                }, 'review')">삭제</button>
              </div>
            </div>
            <div class="star-display">
              ${"★".repeat(post.rating)}${"☆".repeat(5 - post.rating)}
            </div>
            <div class="post-title">${post.title}</div>
            ${
              post.images && post.images.length > 0
                ? `
              <div class="post-images">
                ${post.images
                  .map((img) => `<img src="${img}" alt="후기 이미지" />`)
                  .join("")}
              </div>
            `
                : ""
            }
            <div class="post-meta">
              <span>👍 ${post.likes}개</span>
              <span>💬 ${post.commentCount}개</span>
            </div>
          </div>
        `
    )
    .join("");
}

// 게시글 삭제
function deletePost(id, type) {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  if (type === "daily") {
    dailyPosts = dailyPosts.filter((post) => post.id !== id);
    renderDailyPosts();
  } else {
    reviewPosts = reviewPosts.filter((post) => post.id !== id);
    renderReviewPosts();
  }
}

// 댓글 모달 열기
function openCommentModal(postId, type) {
  currentPostId = postId;
  const post =
    type === "daily"
      ? dailyPosts.find((p) => p.id === postId)
      : reviewPosts.find((p) => p.id === postId);

  if (!post) return;

  document.getElementById("modalPostTitle").textContent = post.title;

  // 이미지 표시
  const imagesContainer = document.getElementById("modalPostImages");
  if (post.images && post.images.length > 0) {
    imagesContainer.innerHTML = `
            <div class="post-images" style="margin: 20px 0;">
              ${post.images
                .map((img) => `<img src="${img}" alt="이미지" />`)
                .join("")}
            </div>
          `;
  } else {
    imagesContainer.innerHTML = "";
  }

  // 별점 표시
  const ratingContainer = document.getElementById("modalPostRating");
  if (post.rating) {
    ratingContainer.innerHTML = `
            <div class="star-display" style="margin: 15px 0;">
              ${"★".repeat(post.rating)}<span style="color: #ddd;">${"★".repeat(
      5 - post.rating
    )}</span>
            </div>
          `;
  } else {
    ratingContainer.innerHTML = "";
  }

  // 내용 표시
  const contentContainer = document.getElementById("modalPostContent");
  if (post.content) {
    contentContainer.innerHTML = `<div style="margin: 15px 0; line-height: 1.6; color: #666;">${post.content}</div>`;
  } else {
    contentContainer.innerHTML = "";
  }

  // 댓글 렌더링
  renderComments(post.comments);

  document.getElementById("commentModal").classList.add("active");
  document.getElementById("commentInput").value = "";
}

// 댓글 모달 닫기
function closeCommentModal() {
  document.getElementById("commentModal").classList.remove("active");
  currentPostId = null;
}

// 댓글 렌더링
function renderComments(comments) {
  const commentList = document.getElementById("commentList");
  const commentCount = document.getElementById("commentCount");

  commentCount.textContent = comments.length;

  if (comments.length === 0) {
    commentList.innerHTML =
      '<div class="no-comments">아직 댓글이 없습니다.</div>';
    return;
  }

  commentList.innerHTML = comments
    .map(
      (comment, index) => `
          <div class="comment-item">
            <div class="comment-header">
              <span class="comment-author">${comment.author}</span>
              <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
          </div>
        `
    )
    .join("");
}

// 댓글 추가
function addComment() {
  const input = document.getElementById("commentInput");
  const text = input.value.trim();

  if (!text) {
    alert("댓글 내용을 입력해주세요!");
    return;
  }

  const post =
    currentTab === "daily"
      ? dailyPosts.find((p) => p.id === currentPostId)
      : reviewPosts.find((p) => p.id === currentPostId);

  if (!post) return;

  const newComment = {
    author: "나",
    text: text,
    date: "방금 전",
  };

  post.comments.push(newComment);
  post.commentCount = post.comments.length;

  renderComments(post.comments);
  input.value = "";

  // 리스트 업데이트
  if (currentTab === "daily") {
    renderDailyPosts();
  } else {
    renderReviewPosts();
  }
}

// Enter 키로 댓글 추가
document.getElementById("commentInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addComment();
  }
});

// 모달 외부 클릭시 닫기
document.getElementById("commentModal").addEventListener("click", (e) => {
  if (e.target.id === "commentModal") {
    closeCommentModal();
  }
});

// 더보기 버튼
document.getElementById("loadMoreDaily").addEventListener("click", () => {
  alert("더 많은 일상 게시글을 불러옵니다!");
});

document.getElementById("loadMoreReview").addEventListener("click", () => {
  alert("더 많은 후기 게시글을 불러옵니다!");
});

// 초기 렌더링
renderDailyPosts();
renderReviewPosts();
