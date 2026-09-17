const API = "http://localhost:3000/api";

const params = new URLSearchParams(window.location.search);
const tenPhim = params.get("phim");

document.getElementById("tenPhim").textContent = tenPhim || "Không xác định";

// ===============================
// BIẾN
// ===============================

let danhSachSuat = [];
let suatDangChon = null;

let gheDangChon = [];

let dichVuDangChon = null;
let nuocDangChon = null;

const giaVe = 70000;
const giaCombo = 30000;
const giaNuoc = 30000;

let soLuongDichVu = 0;
let soLuongNuoc = 0;

// ===============================
// LOAD SUẤT CHIẾU
// ===============================

async function loadSuatChieu() {
  try {
    const response = await fetch(
      `${API}/suatchieu/${encodeURIComponent(tenPhim)}`,
    );

    if (!response.ok) {
      throw new Error("Không thể lấy suất chiếu");
    }

    danhSachSuat = await response.json();

    hienThiNgay();
  } catch (error) {
    console.error(error);
    alert("Không thể tải suất chiếu");
  }
}

// ===============================
// HIỂN THỊ NGÀY
// ===============================

function hienThiNgay() {
  const container = document.getElementById("ngayContainer");

  container.innerHTML = "";

  const ngayDaCo = [];

  danhSachSuat.forEach((suat) => {
    const ngay = suat.NgayChieu.substring(0, 10);

    if (!ngayDaCo.includes(ngay)) {
      ngayDaCo.push(ngay);

      const button = document.createElement("button");

      button.className = "option";
      button.textContent = formatNgay(ngay);
      button.dataset.ngay = ngay;

      button.addEventListener("click", function () {
        document
          .querySelectorAll("#ngayContainer .option")
          .forEach((x) => x.classList.remove("selected"));

        this.classList.add("selected");

        hienThiPhong(ngay);
      });

      container.appendChild(button);
    }
  });
}

// ===============================
// HIỂN THỊ PHÒNG
// ===============================

function hienThiPhong(ngay) {
  const container = document.getElementById("phongContainer");

  container.innerHTML = "";

  document.getElementById("gioContainer").innerHTML = "";
  document.getElementById("gheContainer").innerHTML = "";

  const phongDaCo = [];

  danhSachSuat
    .filter((suat) => suat.NgayChieu.substring(0, 10) === ngay)
    .forEach((suat) => {
      if (!phongDaCo.includes(suat.MaPhong)) {
        phongDaCo.push(suat.MaPhong);

        const button = document.createElement("button");

        button.className = "option";
        button.textContent = suat.TenPhong;

        button.addEventListener("click", function () {
          document
            .querySelectorAll("#phongContainer .option")
            .forEach((x) => x.classList.remove("selected"));

          this.classList.add("selected");

          hienThiGio(ngay, suat.MaPhong);
        });

        container.appendChild(button);
      }
    });
}

// ===============================
// HIỂN THỊ GIỜ
// ===============================

function hienThiGio(ngay, maPhong) {
  const container = document.getElementById("gioContainer");

  container.innerHTML = "";

  danhSachSuat
    .filter(
      (suat) =>
        suat.NgayChieu.substring(0, 10) === ngay && suat.MaPhong === maPhong,
    )
    .forEach((suat) => {
      const button = document.createElement("button");

      button.className = "option";
      button.textContent = formatGio(suat.GioChieu);

      button.addEventListener("click", function () {
        document
          .querySelectorAll("#gioContainer .option")
          .forEach((x) => x.classList.remove("selected"));

        this.classList.add("selected");

        suatDangChon = suat;

        loadGhe(suat.MaSuatChieu);
      });

      container.appendChild(button);
    });
}

// ===============================
// LOAD GHẾ
// ===============================

async function loadGhe(maSuatChieu) {
  try {
    const [gheResponse, daDatResponse] = await Promise.all([
      fetch(`${API}/ghe/${maSuatChieu}`),
      fetch(`${API}/ghe-dadat/${maSuatChieu}`),
    ]);

    const ghe = await gheResponse.json();
    const gheDaDat = await daDatResponse.json();

    const danhSachGheDaDat = gheDaDat.map((item) => Number(item.MaGhe));

    const container = document.getElementById("gheContainer");

    container.innerHTML = "";

    gheDangChon = [];

    ghe.forEach((item) => {
      const button = document.createElement("button");

      button.className = "ghe";
      button.textContent = item.SoGhe;
      button.dataset.maGhe = item.MaGhe;

      if (danhSachGheDaDat.includes(Number(item.MaGhe))) {
        button.classList.add("dadat");
        button.disabled = true;
      }

      button.addEventListener("click", function () {
        const maGhe = Number(this.dataset.maGhe);

        if (this.classList.contains("selected")) {
          this.classList.remove("selected");

          gheDangChon = gheDangChon.filter((x) => x !== maGhe);
        } else {
          this.classList.add("selected");

          gheDangChon.push(maGhe);
        }

        capNhatTongTien();
      });

      container.appendChild(button);
    });
  } catch (error) {
    console.error(error);
    alert("Không thể tải ghế");
  }
}

// ===============================
// LOAD DỊCH VỤ
// ===============================

async function loadDichVu() {
  try {
    const response = await fetch(`${API}/dichvu`);

    const data = await response.json();

    const container = document.getElementById("dichvuContainer");

    container.innerHTML = "";

    data.forEach((item) => {
      const div = document.createElement("div");

      div.className = "dichvu";

      div.innerHTML = `
        <strong>${item.TenDichVu}</strong>
        <br>
        <span>${formatTien(
          Number(item.TenDichVu.includes("Bỏng") ? 30000 : 0),
        )}</span>
      `;

      div.addEventListener("click", function () {
        document
          .querySelectorAll(".dichvu")
          .forEach((x) => x.classList.remove("selected"));

        this.classList.add("selected");

        dichVuDangChon = item;

        // ==================================
        // DỊCH VỤ BỎNG NƯỚC
        // ==================================

        if (item.TenDichVu.includes("Bỏng")) {
          soLuongDichVu = 1;

          document.getElementById("soLuongDichVu").textContent = soLuongDichVu;

          document.getElementById("soLuongDichVuBox").style.display = "flex";

          // Số nước miễn phí ban đầu
          // bằng số combo
          soLuongNuoc = soLuongDichVu;

          document.getElementById("soLuongNuoc").textContent = soLuongNuoc;

          document.getElementById("nuocBox").style.display = "block";

          document.getElementById("soLuongNuocBox").style.display = "flex";

          loadNuoc();
        }

        // ==================================
        // DỊCH VỤ VÉ XEM PHIM
        // ==================================
        else {
          // Vé xem phim KHÔNG cộng tiền
          soLuongDichVu = 0;

          document.getElementById("soLuongDichVu").textContent = 0;

          document.getElementById("soLuongDichVuBox").style.display = "none";

          // Nước bắt đầu từ 0
          soLuongNuoc = 0;

          document.getElementById("soLuongNuoc").textContent = 0;

          document.getElementById("nuocBox").style.display = "block";

          document.getElementById("soLuongNuocBox").style.display = "flex";

          loadNuoc();
        }

        capNhatTongTien();
      });

      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    alert("Không thể tải dịch vụ");
  }
}

// ===============================
// LOAD NƯỚC
// ===============================

async function loadNuoc() {
  try {
    const response = await fetch(`${API}/nuoc`);

    const data = await response.json();

    const container = document.getElementById("nuocContainer");

    container.innerHTML = "";

    data.forEach((item) => {
      const div = document.createElement("div");

      div.className = "nuoc";

      div.textContent = `${item.TenNuoc} - ${formatTien(giaNuoc)}`;

      div.addEventListener("click", function () {
        document
          .querySelectorAll(".nuoc")
          .forEach((x) => x.classList.remove("selected"));

        this.classList.add("selected");

        nuocDangChon = item;

        capNhatTongTien();
      });

      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
  }
}

// ===============================
// TÍNH TỔNG TIỀN
// ===============================

function capNhatTongTien() {
  // ============================
  // TIỀN VÉ
  // ============================

  const tienVe = gheDangChon.length * giaVe;

  // ============================
  // TIỀN COMBO
  // ============================

  let tienCombo = 0;

  if (dichVuDangChon && dichVuDangChon.TenDichVu.includes("Bỏng")) {
    tienCombo = soLuongDichVu * giaCombo;
  }

  // ============================
  // TIỀN NƯỚC
  // ============================

  let tienNuoc = 0;

  if (nuocDangChon) {
    if (dichVuDangChon && dichVuDangChon.TenDichVu.includes("Bỏng")) {
      // Nước được miễn phí bằng số combo
      const soNuocTinhPhi = Math.max(0, soLuongNuoc - soLuongDichVu);

      tienNuoc = soNuocTinhPhi * giaNuoc;
    } else {
      // Vé xem phim thường:
      // tất cả nước đều tính 30k
      tienNuoc = soLuongNuoc * giaNuoc;
    }
  }

  // ============================
  // TỔNG
  // ============================

  const tong = tienVe + tienCombo + tienNuoc;

  document.getElementById("tongTien").textContent = formatTien(tong);
}

// ===============================
// GIẢM SỐ LƯỢNG COMBO
// ===============================

document.getElementById("giamDichVu").addEventListener("click", function () {
  if (soLuongDichVu > 1) {
    soLuongDichVu--;

    document.getElementById("soLuongDichVu").textContent = soLuongDichVu;

    // Nếu số combo giảm thì số nước
    // miễn phí cũng giảm theo
    if (soLuongNuoc > soLuongDichVu) {
      // giữ nguyên số nước khách đã chọn
    } else {
      soLuongNuoc = soLuongDichVu;

      document.getElementById("soLuongNuoc").textContent = soLuongNuoc;
    }

    capNhatTongTien();
  }
});

// ===============================
// TĂNG SỐ LƯỢNG COMBO
// ===============================

document.getElementById("tangDichVu").addEventListener("click", function () {
  // Không cho số combo vượt quá số ghế
  if (soLuongDichVu >= gheDangChon.length) {
    alert("Số lượng combo không được vượt quá số ghế đã đặt!");
    return;
  }

  soLuongDichVu++;

  document.getElementById("soLuongDichVu").textContent = soLuongDichVu;

  // Tăng combo thì tăng số nước miễn phí
  if (soLuongNuoc < soLuongDichVu) {
    soLuongNuoc = soLuongDichVu;

    document.getElementById("soLuongNuoc").textContent = soLuongNuoc;
  }

  capNhatTongTien();
});
// ===============================
// GIẢM SỐ LƯỢNG NƯỚC
// ===============================

document.getElementById("giamNuoc").addEventListener("click", function () {
  // Vé thường có thể giảm về 0
  // Combo thì không được thấp hơn
  // số combo miễn phí

  const minNuoc =
    dichVuDangChon && dichVuDangChon.TenDichVu.includes("Bỏng")
      ? soLuongDichVu
      : 0;

  if (soLuongNuoc > minNuoc) {
    soLuongNuoc--;

    document.getElementById("soLuongNuoc").textContent = soLuongNuoc;

    capNhatTongTien();
  }
});

// ===============================
// TĂNG SỐ LƯỢNG NƯỚC
// ===============================

document.getElementById("tangNuoc").addEventListener("click", function () {
  soLuongNuoc++;

  document.getElementById("soLuongNuoc").textContent = soLuongNuoc;

  capNhatTongTien();
});

// ===============================
// TIẾP TỤC THANH TOÁN
// ===============================

document.getElementById("btnTiepTuc").addEventListener("click", function () {
  if (!suatDangChon) {
    alert("Vui lòng chọn ngày, phòng và giờ");
    return;
  }

  if (gheDangChon.length === 0) {
    alert("Vui lòng chọn ít nhất một ghế");
    return;
  }

  if (!dichVuDangChon) {
    alert("Vui lòng chọn dịch vụ");
    return;
  }

  // Nếu chọn bỏng nước thì phải có nước
  if (dichVuDangChon.TenDichVu.includes("Bỏng") && !nuocDangChon) {
    alert("Vui lòng chọn loại nước");
    return;
  }

  // Nếu chọn vé thường nhưng muốn mua nước
  // thì cũng phải chọn loại nước
  if (
    !dichVuDangChon.TenDichVu.includes("Bỏng") &&
    soLuongNuoc > 0 &&
    !nuocDangChon
  ) {
    alert("Vui lòng chọn loại nước");
    return;
  }

  // ============================
  // TÍNH LẠI TỔNG
  // ============================

  const tienVe = gheDangChon.length * giaVe;

  let tienCombo = 0;

  if (dichVuDangChon.TenDichVu.includes("Bỏng")) {
    tienCombo = soLuongDichVu * giaCombo;
  }

  let tienNuoc = 0;

  if (nuocDangChon) {
    if (dichVuDangChon.TenDichVu.includes("Bỏng")) {
      const soNuocTinhPhi = Math.max(0, soLuongNuoc - soLuongDichVu);

      tienNuoc = soNuocTinhPhi * giaNuoc;
    } else {
      tienNuoc = soLuongNuoc * giaNuoc;
    }
  }

  const tongTien = tienVe + tienCombo + tienNuoc;

  // ============================
  // LƯU THÔNG TIN
  // ============================

  const thongTin = {
    tenPhim: tenPhim,

    maSuatChieu: suatDangChon.MaSuatChieu,

    maPhong: suatDangChon.MaPhong,

    tenPhong: suatDangChon.TenPhong,

    ngayChieu: suatDangChon.NgayChieu,

    gioChieu: suatDangChon.GioChieu,

    ghe: gheDangChon,

    dichVu: dichVuDangChon,

    nuoc: nuocDangChon,

    soLuongGhe: gheDangChon.length,

    soLuongDichVu: soLuongDichVu,

    soLuongNuoc: soLuongNuoc,

    tongTien: tongTien,
  };

  console.log("Thông tin đặt vé:", thongTin);

  localStorage.setItem("thongTinDatVe", JSON.stringify(thongTin));

  window.location.href = "thanhtoan.html";
});

// ===============================
// FORMAT
// ===============================

function formatTien(tien) {
  return Number(tien).toLocaleString("vi-VN") + "đ";
}

function formatNgay(ngay) {
  const date = new Date(ngay);

  return date.toLocaleDateString("vi-VN");
}

function formatGio(gio) {
  return gio.substring(0, 5);
}

// ===============================
// CHẠY
// ===============================

loadSuatChieu();
loadDichVu();
