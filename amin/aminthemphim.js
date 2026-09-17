const addMovieForm = document.getElementById("addMovieForm");

const movieName = document.getElementById("movieName");
const movieDirector = document.getElementById("movieDirector");
const movieActors = document.getElementById("movieActors");
const movieGenre = document.getElementById("movieGenre");
const releaseDate = document.getElementById("releaseDate");
const movieDuration = document.getElementById("movieDuration");
const movieLanguage = document.getElementById("movieLanguage");
const movieRated = document.getElementById("movieRated");
const movieContent = document.getElementById("movieContent");
const movieImage = document.getElementById("movieImage");
const movieTrailer = document.getElementById("movieTrailer");

const addMovieMessage = document.getElementById("addMovieMessage");

addMovieForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // ===============================
  // LẤY DỮ LIỆU TỪ FORM
  // ===============================

  const movieData = {
    AnhPhim: movieImage.value.trim(),

    TenPhim: movieName.value.trim(),

    DaoDien: movieDirector.value.trim(),

    DienVien: movieActors.value.trim(),

    TheLoai: movieGenre.value.trim(),

    KhoiChieu: releaseDate.value,

    ThoiLuong: Number(movieDuration.value),

    Ngonngu: movieLanguage.value.trim(),

    Rated: movieRated.value,

    noidung: movieContent.value.trim(),

    Trailer: movieTrailer.value.trim(),
  };

  try {
    // ===============================
    // GỬI DỮ LIỆU ĐẾN BACKEND
    // ===============================

    const response = await fetch("http://localhost:3000/api/phim", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(movieData),
    });

    const result = await response.json();

    // ===============================
    // THÊM THÀNH CÔNG
    // ===============================

    if (response.ok) {
      addMovieMessage.textContent = result.message;

      addMovieMessage.style.color = "green";

      addMovieForm.reset();

      // Sau 1 giây quay về trang quản lý phim

      setTimeout(function () {
        window.location.href = "./amintrangchu.html";
      }, 1000);
    }

    // ===============================
    // THÊM THẤT BẠI
    // ===============================
    else {
      addMovieMessage.textContent = result.message || "Thêm phim thất bại!";

      addMovieMessage.style.color = "red";
    }
  } catch (error) {
    console.error(error);

    addMovieMessage.textContent = "Không thể kết nối đến Backend!";

    addMovieMessage.style.color = "red";
  }
});
