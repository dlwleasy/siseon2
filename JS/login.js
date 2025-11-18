// DOM 요소
const modalOverlay = document.getElementById("modalOverlay");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const autoLoginCheckbox = document.getElementById("autoLogin");
const naverBtn = document.getElementById("naverBtn");
const kakaoBtn = document.getElementById("kakaoBtn");

// 유효성 검사 함수
function validateUsername(username) {
  if (!username) {
    return { valid: false, message: "아이디를 입력해주세요." };
  }
  if (username.length < 4) {
    return {
      valid: false,
      message: "아이디는 최소 4자 이상이어야 합니다.",
    };
  }
  return { valid: true };
}

function validatePassword(password) {
  if (!password) {
    return { valid: false, message: "비밀번호를 입력해주세요." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      message: "비밀번호는 최소 6자 이상이어야 합니다.",
    };
  }
  return { valid: true };
}

// 에러 메시지 표시
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");

  if (message.includes("아이디")) {
    usernameInput.classList.add("error");
  }
  if (message.includes("비밀번호")) {
    passwordInput.classList.add("error");
  }
}

// 에러 메시지 숨기기
function hideError() {
  errorMessage.classList.remove("show");
  usernameInput.classList.remove("error");
  passwordInput.classList.remove("error");
}

// 로그인 처리 (백엔드 API 연동)
async function handleLogin(username, password, autoLogin) {
  // 실제 API 호출
  try {
    const response = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, autoLogin }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "로그인에 실패했습니다.");
    }

    return data;
  } catch (error) {
    // 서버 연결 실패 시 테스트 로그인
    console.warn("서버 연결 실패, 테스트 모드로 전환");
    if (username === "testuser" && password === "password123") {
      return {
        success: true,
        user: {
          id: 1,
          username: username,
          name: "테스트유저",
          email: "test@example.com",
        },
        token: "fake-jwt-token-" + Date.now(),
      };
    } else {
      throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  }
}

// 로그인 성공 처리
function handleLoginSuccess(data) {
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("token", data.token);

  if (autoLoginCheckbox.checked) {
    localStorage.setItem("autoLogin", "true");
  }

  alert(`${data.user.name}님, 환영합니다!`);

  // 이전 페이지 또는 대시보드로 이동
  const redirectTo =
    sessionStorage.getItem("redirectAfterLogin") || "/home.html";
  window.location.href = redirectTo;
}

// 입력 필드 이벤트
usernameInput.addEventListener("focus", hideError);
passwordInput.addEventListener("focus", hideError);

// 실시간 유효성 검사
usernameInput.addEventListener("input", () => {
  if (usernameInput.value) {
    const validation = validateUsername(usernameInput.value);
    if (!validation.valid) {
      usernameInput.classList.add("error");
    } else {
      usernameInput.classList.remove("error");
    }
  }
});

passwordInput.addEventListener("input", () => {
  if (passwordInput.value) {
    const validation = validatePassword(passwordInput.value);
    if (!validation.valid) {
      passwordInput.classList.add("error");
    } else {
      passwordInput.classList.remove("error");
    }
  }
});

// 엔터키로 로그인
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSubmit();
  }
});

// 로그인 처리
async function handleSubmit() {
  hideError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const autoLogin = autoLoginCheckbox.checked;

  // 버튼 비활성화
  loginBtn.disabled = true;
  loginBtn.textContent = "로그인 중...";

  // 유효성 검사
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    showError(usernameValidation.message);
    usernameInput.focus();
    loginBtn.disabled = false;
    loginBtn.textContent = "로그인";
    return;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    showError(passwordValidation.message);
    passwordInput.focus();
    loginBtn.disabled = false;
    loginBtn.textContent = "로그인";
    return;
  }

  try {
    const data = await handleLogin(username, password, autoLogin);

    if (data.success) {
      handleLoginSuccess(data);
    }
  } catch (error) {
    showError(error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = "로그인";
  }
}

// 폼 제출
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSubmit();
});

// X 버튼 - 이전 페이지로
closeBtn.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/";
  }
});

// ESC 키 - 이전 페이지로
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }
});

// 네이버 로그인
naverBtn.addEventListener("click", () => {
  alert("네이버 로그인 기능은 준비 중입니다.");
  // window.location.href = 'https://nid.naver.com/oauth2.0/authorize?...';
});

// 카카오 로그인
kakaoBtn.addEventListener("click", () => {
  alert("카카오톡 로그인 기능은 준비 중입니다.");
  // window.location.href = 'https://kauth.kakao.com/oauth/authorize?...';
});

// 자동 로그인 확인
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  const autoLogin = localStorage.getItem("autoLogin");

  if (token && autoLogin === "true") {
    window.location.href = "/home.html";
  }
});

console.log("=== 테스트 계정 ===");
console.log("아이디: testuser");
console.log("비밀번호: password123");
