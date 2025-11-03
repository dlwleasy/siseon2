// 공지사항 탭 전환 기능

document.addEventListener("DOMContentLoaded", function () {
  // 탭 버튼들과 컨텐츠들 가져오기
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const banners = document.querySelectorAll(".banner");

  // 각 탭 버튼에 클릭 이벤트 추가
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 현재 활성화된 탭과 배너 제거
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      banners.forEach((banner) => banner.classList.remove("active"));

      // 클릭한 탭 활성화
      this.classList.add("active");

      // 해당 탭의 컨텐츠와 배너 보여주기
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
      document.getElementById("banner-" + tabId).classList.add("active");

      // ⭐ 탭 전환 시 검색 초기화
      searchInput.value = "";
      const newActiveTab = document.getElementById(tabId);
      const allRows = newActiveTab.querySelectorAll("tbody tr");
      allRows.forEach((row) => {
        row.style.display = "";
      });
    });
  });

  // 검색 기능
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === "") {
      alert("검색어를 입력해주세요.");
      return;
    }

    // 현재 활성화된 탭의 모든 행 가져오기
    const activeTab = document.querySelector(".tab-content.active");
    const rows = activeTab.querySelectorAll("tbody tr");
    let foundCount = 0;

    rows.forEach((row) => {
      const title = row.querySelector(".title").textContent.toLowerCase();

      if (title.includes(searchTerm)) {
        row.style.display = "";
        foundCount++;
      } else {
        row.style.display = "none";
      }
    });

    if (foundCount === 0) {
      alert("검색 결과가 없습니다.");
      // 모든 행 다시 보이기
      rows.forEach((row) => {
        row.style.display = "";
      });
      searchInput.value = "";
    }
  }

  // 검색 버튼 클릭
  searchBtn.addEventListener("click", performSearch);

  // 엔터키로 검색
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // 검색어 초기화 (input이 비워질 때)
  searchInput.addEventListener("input", function () {
    if (this.value === "") {
      const activeTab = document.querySelector(".tab-content.active");
      const rows = activeTab.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        row.style.display = "";
      });
    }
  });

  // 페이지네이션 버튼 이벤트 (추후 구현)
  const pageButtons = document.querySelectorAll(".page-btn");
  pageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!this.classList.contains("active")) {
        pageButtons.forEach((btn) => btn.classList.remove("active"));

        // 숫자 버튼만 활성화 (화살표 버튼 제외)
        if (!isNaN(this.textContent)) {
          this.classList.add("active");
        }

        // 여기에 실제 페이지 전환 로직 추가 가능
        console.log("페이지 전환:", this.textContent);
      }
    });
  });
});
