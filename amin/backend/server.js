const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { sql, poolPromise } = require("./db");

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: "web-dat-ve-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.get("/", (req, res) => {
  res.send("Backend đang chạy!");
});

app.get("/test-db", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query("SELECT GETDATE() AS ThoiGian");

    res.json({
      message: "Kết nối SQL Server thành công!",
      data: result.recordset,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kết nối SQL Server thất bại!",
      error: error.message,
    });
  }
});

app.post("/api/phim", async (req, res) => {
  try {
    const {
      AnhPhim,
      TenPhim,
      DaoDien,
      DienVien,
      TheLoai,
      KhoiChieu,
      ThoiLuong,
      Ngonngu,
      Rated,
      noidung,
      Trailer,
    } = req.body;

    const pool = await poolPromise;

    await pool
      .request()

      .input("AnhPhim", sql.NVarChar(500), AnhPhim)

      .input("TenPhim", sql.NVarChar(255), TenPhim)

      .input("DaoDien", sql.NVarChar(255), DaoDien)

      .input("DienVien", sql.NVarChar(500), DienVien)

      .input("TheLoai", sql.NVarChar(100), TheLoai)

      .input("KhoiChieu", sql.Date, KhoiChieu)

      .input("ThoiLuong", sql.Int, ThoiLuong)

      .input("Ngonngu", sql.NVarChar(50), Ngonngu)

      .input("Rated", sql.NVarChar(50), Rated)

      .input("noidung", sql.NVarChar(sql.MAX), noidung)
      .input("Trailer", sql.NVarChar(500), Trailer).query(`
                INSERT INTO Phim
                (
                    AnhPhim,
                    TenPhim,
                    DaoDien,
                    DienVien,
                    TheLoai,
                    KhoiChieu,
                    ThoiLuong,
                    Ngonngu,
                    Rated,
                    noidung,
                    Trailer
                )

                VALUES
                (
                    @AnhPhim,
                    @TenPhim,
                    @DaoDien,
                    @DienVien,
                    @TheLoai,
                    @KhoiChieu,
                    @ThoiLuong,
                    @Ngonngu,
                    @Rated,
                    @noidung,
                    @Trailer
                )
            `);

    res.json({
      message: "Thêm phim thành công!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Thêm phim thất bại!",
      error: error.message,
    });
  }
});

app.get("/api/phim", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
                SELECT *
                FROM Phim
                ORDER BY KhoiChieu DESC
            `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách phim!",
      error: error.message,
    });
  }
});
//hoho

// ==========================================
// LẤY CHI TIẾT 1 PHIM
// Ví dụ:
// /api/phim/1
// /api/phim/2
// /api/phim/3
// ==========================================

app.get("/api/phim/:id", async (req, res) => {
  try {
    const maPhim = Number(req.params.id);

    // Kiểm tra ID có phải số không
    if (isNaN(maPhim)) {
      return res.status(400).json({
        message: "Mã phim không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    const result = await pool.request().input("MaPhim", sql.Int, maPhim).query(`
        SELECT
          MaPhim,
          AnhPhim,
          TenPhim,
          DaoDien,
          DienVien,
          TheLoai,
          KhoiChieu,
          ThoiLuong,
          Ngonngu,
          Rated,
          noidung
        FROM Phim
        WHERE MaPhim = @MaPhim
      `);

    // Không tìm thấy phim
    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phim!",
      });
    }

    // Trả thông tin phim
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy thông tin phim!",
      error: error.message,
    });
  }
});

//hehe
app.delete("/api/phim/:tenphim", async (req, res) => {
  try {
    const tenPhim = req.params.tenphim;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("TenPhim", sql.NVarChar(255), tenPhim).query(`
                DELETE FROM Phim
                WHERE TenPhim = @TenPhim
            `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phim!",
      });
    }

    res.json({
      message: "Xóa phim thành công!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Xóa phim thất bại!",
      error: error.message,
    });
  }
});

app.get("/api/vemyt/:maTaiKhoan", async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.maTaiKhoan);

    if (!maTaiKhoan) {
      return res.status(400).json({
        message: "Mã tài khoản không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    const result = await pool.request().input("MaTaiKhoan", sql.Int, maTaiKhoan)
      .query(`
        SELECT
          dv.MaDatVe,
          tk.HoTen,
          p.TenPhim,
          pc.TenPhong,
          sc.NgayChieu,
          sc.GioChieu,
          dv.TongTien,
          dv.PhuongThucThanhToan,
          dv.TrangThai,
          dv.NgayDat,
          STRING_AGG(g.SoGhe, ', ') AS Ghe
        FROM DatVe dv
        INNER JOIN TaiKhoan tk
          ON dv.MaTaiKhoan = tk.MaTaiKhoan
        INNER JOIN SuatChieu sc
          ON dv.MaSuatChieu = sc.MaSuatChieu
        INNER JOIN Phim p
          ON sc.TenPhim = p.TenPhim
        INNER JOIN PhongChieu pc
          ON sc.MaPhong = pc.MaPhong
        INNER JOIN ChiTietDatVe ctdv
          ON dv.MaDatVe = ctdv.MaDatVe
        INNER JOIN Ghe g
          ON ctdv.MaGhe = g.MaGhe
        WHERE dv.MaTaiKhoan = @MaTaiKhoan
        GROUP BY
          dv.MaDatVe,
          tk.HoTen,
          p.TenPhim,
          pc.TenPhong,
          sc.NgayChieu,
          sc.GioChieu,
          dv.TongTien,
          dv.PhuongThucThanhToan,
          dv.TrangThai,
          dv.NgayDat
        ORDER BY dv.NgayDat DESC
      `);

    console.log("VÉ CỦA TÀI KHOẢN", maTaiKhoan, ":", result.recordset);

    res.json(result.recordset);
  } catch (error) {
    console.error("LỖI LẤY VÉ:", error);

    res.status(500).json({
      message: "Không thể lấy vé",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

app.post("/api/dangky", async (req, res) => {
  try {
    const { HoTen, SoDienThoai, MatKhau } = req.body;

    // Kiểm tra dữ liệu
    if (!HoTen || !SoDienThoai || !MatKhau) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin!",
      });
    }

    const pool = await poolPromise;

    // Kiểm tra số điện thoại đã tồn tại
    const checkAccount = await pool
      .request()
      .input("SoDienThoai", sql.NVarChar(20), SoDienThoai).query(`
                SELECT *
                FROM TaiKhoan
                WHERE SoDienThoai = @SoDienThoai
            `);

    if (checkAccount.recordset.length > 0) {
      return res.status(400).json({
        message: "Số điện thoại đã tồn tại!",
      });
    }

    // Thêm tài khoản
    await pool
      .request()
      .input("HoTen", sql.NVarChar(100), HoTen)
      .input("SoDienThoai", sql.NVarChar(20), SoDienThoai)
      .input("MatKhau", sql.NVarChar(255), MatKhau).query(`
                INSERT INTO TaiKhoan
                (
                    HoTen,
                    SoDienThoai,
                    MatKhau
                )
                VALUES
                (
                    @HoTen,
                    @SoDienThoai,
                    @MatKhau
                )
            `);

    res.json({
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Đăng ký thất bại!",
      error: error.message,
    });
  }
});

app.post("/api/dangnhap", async (req, res) => {
  try {
    const { SoDienThoai, MatKhau } = req.body;

    // ============================
    // KIỂM TRA DỮ LIỆU
    // ============================

    if (!SoDienThoai || !MatKhau) {
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại và mật khẩu!",
      });
    }

    const pool = await poolPromise;

    // ============================
    // KIỂM TRA TÀI KHOẢN
    // ============================

    const result = await pool
      .request()
      .input("SoDienThoai", sql.NVarChar(20), SoDienThoai)
      .input("MatKhau", sql.NVarChar(255), MatKhau).query(`
        SELECT
          MaTaiKhoan,
          HoTen,
          SoDienThoai,
          VaiTro,
          TrangThai
        FROM TaiKhoan
        WHERE SoDienThoai = @SoDienThoai
        AND MatKhau = @MatKhau
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        message: "Số điện thoại hoặc mật khẩu không đúng!",
      });
    }

    const user = result.recordset[0];

    // ============================
    // KIỂM TRA TRẠNG THÁI
    // ============================

    if (user.TrangThai !== "Hoạt động") {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa!",
      });
    }

    // ============================
    // LƯU SESSION
    // ============================

    req.session.maTaiKhoan = user.MaTaiKhoan;
    req.session.hoTen = user.HoTen;
    req.session.vaiTro = user.VaiTro;

    // Chờ session lưu xong rồi mới trả response
    req.session.save((err) => {
      if (err) {
        console.error("Lỗi lưu session:", err);

        return res.status(500).json({
          message: "Không thể lưu phiên đăng nhập!",
        });
      }

      console.log("SESSION SAU KHI ĐĂNG NHẬP:", req.session);

      // CHỈ res.json() 1 LẦN
      return res.json({
        message: "Đăng nhập thành công!",
        user: user,
      });
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Đăng nhập thất bại!",
      error: error.message,
    });
  }
});

// test
app.get("/api/taikhoan", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
                SELECT
                    MaTaiKhoan,
                    HoTen,
                    SoDienThoai,
                    VaiTro,
                    NgayTao,
                    TrangThai
                FROM TaiKhoan
                ORDER BY MaTaiKhoan ASC
            `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách tài khoản!",
      error: error.message,
    });
  }
});

app.put("/api/taikhoan/:id/trangthai", async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.id);

    if (isNaN(maTaiKhoan)) {
      return res.status(400).json({
        message: "Mã tài khoản không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    // Tìm tài khoản
    const checkAccount = await pool
      .request()
      .input("MaTaiKhoan", sql.Int, maTaiKhoan).query(`
        SELECT MaTaiKhoan, TrangThai
        FROM TaiKhoan
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    if (checkAccount.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản!",
      });
    }

    const trangThaiHienTai = checkAccount.recordset[0].TrangThai.trim();

    let trangThaiMoi;

    if (trangThaiHienTai === "Hoạt động") {
      trangThaiMoi = "Bị khóa";
    } else if (trangThaiHienTai === "Bị khóa") {
      trangThaiMoi = "Hoạt động";
    } else {
      return res.status(400).json({
        message: "Trạng thái tài khoản không hợp lệ!",
      });
    }

    // Cập nhật trạng thái
    await pool
      .request()
      .input("MaTaiKhoan", sql.Int, maTaiKhoan)
      .input("TrangThai", sql.NVarChar(50), trangThaiMoi).query(`
        UPDATE TaiKhoan
        SET TrangThai = @TrangThai
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    res.json({
      message: "Cập nhật trạng thái thành công!",
      TrangThai: trangThaiMoi,
    });
  } catch (error) {
    console.error("LỖI KHÓA/MỞ KHÓA TÀI KHOẢN:", error);

    res.status(500).json({
      message: "Không thể cập nhật trạng thái tài khoản!",
      error: error.message,
    });
  }
});

app.put("/api/taikhoan/:id/vaitro", async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.id);
    const { VaiTro } = req.body;

    // Kiểm tra quyền có hợp lệ không
    const danhSachVaiTro = ["Quản lý", "Nhân viên", "Khách hàng"];

    if (!danhSachVaiTro.includes(VaiTro)) {
      return res.status(400).json({
        message: "Vai trò không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    // Kiểm tra tài khoản có tồn tại không
    const checkAccount = await pool
      .request()
      .input("MaTaiKhoan", sql.Int, maTaiKhoan).query(`
        SELECT *
        FROM TaiKhoan
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    if (checkAccount.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản!",
      });
    }

    // Cập nhật quyền
    await pool
      .request()
      .input("MaTaiKhoan", sql.Int, maTaiKhoan)
      .input("VaiTro", sql.NVarChar(50), VaiTro).query(`
        UPDATE TaiKhoan
        SET VaiTro = @VaiTro
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    res.json({
      message: "Đổi quyền thành công!",
      VaiTro: VaiTro,
    });
  } catch (error) {
    console.error("LỖI ĐỔI QUYỀN:", error);

    res.status(500).json({
      message: "Không thể đổi quyền tài khoản!",
      error: error.message,
    });
  }
});
//xóa
app.delete("/api/taikhoan/:id", async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.id);

    const pool = await poolPromise;

    const result = await pool.request().input("MaTaiKhoan", sql.Int, maTaiKhoan)
      .query(`
                DELETE FROM TaiKhoan
                WHERE MaTaiKhoan = @MaTaiKhoan
            `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản!",
      });
    }

    res.json({
      message: "Xóa tài khoản thành công!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Xóa tài khoản thất bại!",
      error: error.message,
    });
  }
});

// ==========================================
// LẤY CHI TIẾT PHIM BẰNG TÊN PHIM
//
// Ví dụ:
// /api/phim/NGƯỜI%20NHỆN%3A%20KHỞI%20ĐẦU%20MỚI
// ==========================================

app.get("/api/phim", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        AnhPhim,
        TenPhim,
        DaoDien,
        DienVien,
        TheLoai,
        KhoiChieu,
        ThoiLuong,
        Ngonngu,
        Rated,
        noidung
      FROM Phim
      ORDER BY KhoiChieu DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách phim!",
      error: error.message,
    });
  }
});
app.get("/api/phim/:tenphim", async (req, res) => {
  try {
    const tenPhim = req.params.tenphim;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("TenPhim", sql.NVarChar(255), tenPhim).query(`
        SELECT
          AnhPhim,
          TenPhim,
          DaoDien,
          DienVien,
          TheLoai,
          KhoiChieu,
          ThoiLuong,
          Ngonngu,
          Rated,
          noidung
        FROM Phim
        WHERE TenPhim = @TenPhim
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phim!",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy thông tin phim!",
      error: error.message,
    });
  }
});

// test

app.get("/api/suatchieu/:tenPhim", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("TenPhim", sql.NVarChar(255), req.params.tenPhim).query(`
        SELECT
          sc.MaSuatChieu,
          sc.TenPhim,
          sc.MaPhong,
          pc.TenPhong,
          sc.NgayChieu,
          sc.GioChieu
        FROM SuatChieu sc
        INNER JOIN PhongChieu pc
          ON sc.MaPhong = pc.MaPhong
        WHERE sc.TenPhim = @TenPhim
        ORDER BY sc.NgayChieu, sc.GioChieu
      `);

    const danhSachSuat = result.recordset.map((suat) => {
      let gioChieu = suat.GioChieu;

      if (gioChieu instanceof Date) {
        gioChieu =
          String(gioChieu.getUTCHours()).padStart(2, "0") +
          ":" +
          String(gioChieu.getUTCMinutes()).padStart(2, "0");
      } else if (typeof gioChieu === "string") {
        gioChieu = gioChieu.substring(0, 5);
      }

      return {
        MaSuatChieu: suat.MaSuatChieu,
        TenPhim: suat.TenPhim,
        MaPhong: suat.MaPhong,
        TenPhong: suat.TenPhong,
        NgayChieu: suat.NgayChieu,
        GioChieu: gioChieu,
      };
    });

    res.json(danhSachSuat);
  } catch (error) {
    console.error("LỖI LẤY SUẤT CHIẾU:", error);

    res.status(500).json({
      message: "Không thể lấy suất chiếu",
    });
  }
});

app.get("/api/ghe/:maSuatChieu", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("MaSuatChieu", sql.Int, req.params.maSuatChieu).query(`
        SELECT
          g.MaGhe,
          g.MaPhong,
          g.SoGhe,
          g.LoaiGhe
        FROM Ghe g
        INNER JOIN SuatChieu sc
          ON g.MaPhong = sc.MaPhong
        WHERE sc.MaSuatChieu = @MaSuatChieu
        ORDER BY
          LEFT(g.SoGhe, 1),
          TRY_CAST(SUBSTRING(g.SoGhe, 2, LEN(g.SoGhe)) AS INT)
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách ghế",
    });
  }
});
app.get("/api/ghe-dadat/:maSuatChieu", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("MaSuatChieu", sql.Int, req.params.maSuatChieu).query(`
                SELECT
                    cd.MaGhe,
                    g.SoGhe
                FROM ChiTietDatVe cd
                INNER JOIN Ghe g
                    ON cd.MaGhe = g.MaGhe
                WHERE cd.MaSuatChieu = @MaSuatChieu
            `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy ghế đã đặt",
    });
  }
});

app.get("/api/dichvu", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
                SELECT *
                FROM DichVu
            `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy dịch vụ",
    });
  }
});

app.get("/api/nuoc", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
                SELECT *
                FROM Nuoc
            `);

    res.json(result.recordset);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách nước",
    });
  }
});

app.post("/api/datve", async (req, res) => {
  const transaction = new sql.Transaction();

  try {
    const {
      maTaiKhoan,
      maSuatChieu,
      ghe,
      tongTien,
      phuongThucThanhToan,
      dichVu,
    } = req.body;

    // ============================
    // KIỂM TRA DỮ LIỆU
    // ============================

    if (!maTaiKhoan) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được tài khoản!",
      });
    }

    if (!maSuatChieu || !ghe || ghe.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đặt vé",
      });
    }

    // ============================
    // BẮT ĐẦU TRANSACTION
    // CHỈ CÓ 1 LẦN
    // ============================

    await transaction.begin();

    // ============================
    // KIỂM TRA GHẾ ĐÃ ĐƯỢC ĐẶT
    // ============================

    const request = new sql.Request(transaction);

    const check = await request.input("MaSuatChieu", sql.Int, maSuatChieu)
      .query(`
        SELECT MaGhe
        FROM ChiTietDatVe
        WHERE MaSuatChieu = @MaSuatChieu
        AND MaGhe IN (${ghe.join(",")})
      `);

    if (check.recordset.length > 0) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message: "Có ghế đã được đặt trước",
      });
    }

    // ============================
    // TẠO ĐƠN ĐẶT VÉ
    // ============================

    const datVeRequest = new sql.Request(transaction);

    const datVe = await datVeRequest
      .input("MaTaiKhoan", sql.Int, maTaiKhoan)
      .input("MaSuatChieu", sql.Int, maSuatChieu)
      .input("TongTien", sql.Decimal(12, 2), tongTien)
      .input("PhuongThucThanhToan", sql.NVarChar, phuongThucThanhToan).query(`
        INSERT INTO DatVe
        (
          MaTaiKhoan,
          MaSuatChieu,
          TongTien,
          PhuongThucThanhToan
        )
        OUTPUT INSERTED.MaDatVe
        VALUES
        (
          @MaTaiKhoan,
          @MaSuatChieu,
          @TongTien,
          @PhuongThucThanhToan
        )
      `);

    const maDatVe = datVe.recordset[0].MaDatVe;

    // ============================
    // THÊM GHẾ
    // ============================

    for (const maGhe of ghe) {
      const gheRequest = new sql.Request(transaction);

      await gheRequest
        .input("MaDatVe", sql.Int, maDatVe)
        .input("MaSuatChieu", sql.Int, maSuatChieu)
        .input("MaGhe", sql.Int, maGhe)
        .input("DonGia", sql.Decimal(12, 2), 70000).query(`
          INSERT INTO ChiTietDatVe
          (
            MaDatVe,
            MaSuatChieu,
            MaGhe,
            DonGia
          )
          VALUES
          (
            @MaDatVe,
            @MaSuatChieu,
            @MaGhe,
            @DonGia
          )
        `);
    }

    // ============================
    // THÊM DỊCH VỤ
    // ============================

    if (dichVu && dichVu.length > 0) {
      for (const dv of dichVu) {
        const dvRequest = new sql.Request(transaction);

        await dvRequest
          .input("MaDatVe", sql.Int, maDatVe)
          .input("MaDichVu", sql.Int, dv.maDichVu)
          .input("MaNuoc", sql.Int, dv.maNuoc || null)
          .input("SoLuong", sql.Int, dv.soLuong)
          .input("DonGia", sql.Decimal(12, 2), dv.donGia).query(`
            INSERT INTO ChiTietDichVu
            (
              MaDatVe,
              MaDichVu,
              MaNuoc,
              SoLuong,
              DonGia
            )
            VALUES
            (
              @MaDatVe,
              @MaDichVu,
              @MaNuoc,
              @SoLuong,
              @DonGia
            )
          `);
      }
    }

    // ============================
    // HOÀN TẤT
    // ============================

    await transaction.commit();

    res.json({
      success: true,
      maDatVe: maDatVe,
      message: "Đặt vé thành công",
    });
  } catch (error) {
    console.error("LỖI ĐẶT VÉ:", error);

    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Lỗi rollback:", rollbackError);
    }

    res.status(500).json({
      success: false,
      message: "Đặt vé thất bại",
      error: error.message,
    });
  }
});

app.get("/api/phongchieu", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        MaPhong,
        TenPhong,
        SoLuongGhe
      FROM PhongChieu
      ORDER BY MaPhong
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("LỖI LẤY PHÒNG:", error);

    res.status(500).json({
      message: "Không thể lấy danh sách phòng chiếu",
    });
  }
});

app.post("/api/suatchieu", async (req, res) => {
  try {
    const { tenPhim, maPhong, ngayChieu, gioChieu } = req.body;

    if (!tenPhim || !maPhong || !ngayChieu || !gioChieu) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin!",
      });
    }

    const pool = await poolPromise;

    // ==================================
    // KIỂM TRA PHIM CÓ TỒN TẠI KHÔNG
    // ==================================

    const checkPhim = await pool
      .request()
      .input("TenPhim", sql.NVarChar(255), tenPhim).query(`
        SELECT TenPhim
        FROM Phim
        WHERE TenPhim = @TenPhim
      `);

    if (checkPhim.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phim!",
      });
    }

    // ==================================
    // KIỂM TRA PHÒNG CÓ TỒN TẠI KHÔNG
    // ==================================

    const checkPhong = await pool.request().input("MaPhong", sql.Int, maPhong)
      .query(`
        SELECT MaPhong
        FROM PhongChieu
        WHERE MaPhong = @MaPhong
      `);

    if (checkPhong.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phòng chiếu!",
      });
    }

    // ==================================
    // KIỂM TRA TRÙNG SUẤT
    // ==================================

    const checkTrung = await pool
      .request()
      .input("MaPhong", sql.Int, maPhong)
      .input("NgayChieu", sql.Date, ngayChieu)
      .input("GioChieu", sql.Time, gioChieu).query(`
        SELECT MaSuatChieu
        FROM SuatChieu
        WHERE MaPhong = @MaPhong
        AND NgayChieu = @NgayChieu
        AND GioChieu = @GioChieu
      `);

    if (checkTrung.recordset.length > 0) {
      return res.status(409).json({
        message: "Phòng này đã có suất chiếu vào thời gian này!",
      });
    }

    // ==================================
    // THÊM
    // ==================================

    await pool
      .request()
      .input("TenPhim", sql.NVarChar(255), tenPhim)
      .input("MaPhong", sql.Int, maPhong)
      .input("NgayChieu", sql.Date, ngayChieu)
      .input("GioChieu", sql.Time, gioChieu).query(`
        INSERT INTO SuatChieu
        (
          TenPhim,
          MaPhong,
          NgayChieu,
          GioChieu
        )
        VALUES
        (
          @TenPhim,
          @MaPhong,
          @NgayChieu,
          @GioChieu
        )
      `);

    res.json({
      success: true,
      message: "Thêm suất chiếu thành công!",
    });
  } catch (error) {
    console.error("LỖI THÊM SUẤT CHIẾU:", error);

    res.status(500).json({
      message: "Không thể thêm suất chiếu",
      error: error.message,
    });
  }
});
app.delete("/api/suatchieu/:maSuatChieu", async (req, res) => {
  try {
    const maSuatChieu = Number(req.params.maSuatChieu);

    if (!maSuatChieu) {
      return res.status(400).json({
        message: "Mã suất chiếu không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    // ==================================
    // KIỂM TRA ĐÃ CÓ VÉ CHƯA
    // ==================================

    const checkVe = await pool
      .request()
      .input("MaSuatChieu", sql.Int, maSuatChieu).query(`
        SELECT MaDatVe
        FROM DatVe
        WHERE MaSuatChieu = @MaSuatChieu
      `);

    if (checkVe.recordset.length > 0) {
      return res.status(409).json({
        message: "Không thể xóa suất chiếu vì đã có người đặt vé!",
      });
    }

    // ==================================
    // XÓA
    // ==================================

    await pool.request().input("MaSuatChieu", sql.Int, maSuatChieu).query(`
        DELETE FROM SuatChieu
        WHERE MaSuatChieu = @MaSuatChieu
      `);

    res.json({
      success: true,

      message: "Xóa suất chiếu thành công!",
    });
  } catch (error) {
    console.error("LỖI XÓA SUẤT CHIẾU:", error);

    res.status(500).json({
      message: "Không thể xóa suất chiếu",

      error: error.message,
    });
  }
});

app.get("/api/admin/chitietkhachhang/:maSuatChieu", async (req, res) => {
  try {
    const maSuatChieu = Number(req.params.maSuatChieu);

    if (!maSuatChieu) {
      return res.status(400).json({
        message: "Mã suất chiếu không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("MaSuatChieu", sql.Int, maSuatChieu).query(`
        SELECT
          dv.MaDatVe,
          tk.HoTen,
          tk.SoDienThoai,

          p.TenPhim,

          pc.TenPhong,

          sc.NgayChieu,
          sc.GioChieu,

          ghe.Ghe,

          dv.TongTien,

          dichvu.DichVu

        FROM DatVe dv

        INNER JOIN TaiKhoan tk
          ON dv.MaTaiKhoan = tk.MaTaiKhoan

        INNER JOIN SuatChieu sc
          ON dv.MaSuatChieu = sc.MaSuatChieu

        INNER JOIN Phim p
          ON sc.TenPhim = p.TenPhim

        INNER JOIN PhongChieu pc
          ON sc.MaPhong = pc.MaPhong

        OUTER APPLY
        (
          SELECT
            STRING_AGG(
              CONVERT(NVARCHAR(MAX), g.SoGhe),
              N', '
            ) AS Ghe

          FROM ChiTietDatVe ctdv

          INNER JOIN Ghe g
            ON ctdv.MaGhe = g.MaGhe

          WHERE ctdv.MaDatVe = dv.MaDatVe
        ) ghe

        OUTER APPLY
        (
          SELECT
            STRING_AGG(
              CONVERT(
                NVARCHAR(MAX),
                d.TenDichVu
                + N' x'
                + CAST(ctdv2.SoLuong AS NVARCHAR(10))
              ),
              N', '
            ) AS DichVu

          FROM ChiTietDichVu ctdv2

          INNER JOIN DichVu d
            ON ctdv2.MaDichVu = d.MaDichVu

          WHERE ctdv2.MaDatVe = dv.MaDatVe
        ) dichvu

        WHERE dv.MaSuatChieu = @MaSuatChieu

        ORDER BY dv.MaDatVe DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("LỖI CHI TIẾT KHÁCH HÀNG:", error);

    res.status(500).json({
      message: "Không thể lấy thông tin khách hàng",
      error: error.message,
    });
  }
});

//xoa ve của khach
app.delete("/api/admin/xoave/:maDatVe", async (req, res) => {
  const maDatVe = Number(req.params.maDatVe);

  if (!maDatVe) {
    return res.status(400).json({
      message: "Mã đặt vé không hợp lệ!",
    });
  }

  let transaction;

  try {
    const pool = await poolPromise;

    transaction = new sql.Transaction(pool);

    await transaction.begin();

    // 1. Kiểm tra vé
    const checkVe = await new sql.Request(transaction).input(
      "MaDatVe",
      sql.Int,
      maDatVe,
    ).query(`
                SELECT
                    MaDatVe,
                    MaSuatChieu
                FROM DatVe
                WHERE MaDatVe = @MaDatVe
            `);

    if (checkVe.recordset.length === 0) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Không tìm thấy vé!",
      });
    }

    // 2. Xóa dịch vụ
    await new sql.Request(transaction).input("MaDatVe", sql.Int, maDatVe)
      .query(`
                DELETE FROM ChiTietDichVu
                WHERE MaDatVe = @MaDatVe
            `);

    // 3. Xóa ghế
    await new sql.Request(transaction).input("MaDatVe", sql.Int, maDatVe)
      .query(`
                DELETE FROM ChiTietDatVe
                WHERE MaDatVe = @MaDatVe
            `);

    // 4. Xóa vé
    await new sql.Request(transaction).input("MaDatVe", sql.Int, maDatVe)
      .query(`
                DELETE FROM DatVe
                WHERE MaDatVe = @MaDatVe
            `);

    await transaction.commit();

    res.json({
      success: true,

      message: "Xóa vé thành công!",
    });
  } catch (error) {
    console.error("LỖI XÓA VÉ:", error);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("LỖI ROLLBACK:", rollbackError);
      }
    }

    res.status(500).json({
      message: "Không thể xóa vé",

      error: error.message,
    });
  }
});

app.put("/api/phim/:tenphim/trangthai", async (req, res) => {
  try {
    const tenPhim = req.params.tenphim;
    const { TrangThai } = req.body;

    if (TrangThai !== "Hoạt động" && TrangThai !== "Ngừng chiếu") {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ!",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("TenPhim", sql.NVarChar(255), tenPhim)
      .input("TrangThai", sql.NVarChar(50), TrangThai).query(`
        UPDATE Phim
        SET TrangThai = @TrangThai
        WHERE TenPhim = @TenPhim
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy phim!",
      });
    }

    res.json({
      message: "Cập nhật trạng thái thành công!",
      TrangThai: TrangThai,
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);

    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái!",
    });
  }
});
// thể loại
app.get("/api/theloai", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT *
      FROM TheLoai
      ORDER BY MaTheLoai ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi lấy thể loại:", error);

    res.status(500).json({
      message: "Lỗi server!",
    });
  }
});
app.post("/api/theloai", async (req, res) => {
  try {
    const { TenTheLoai } = req.body;

    if (!TenTheLoai || TenTheLoai.trim() === "") {
      return res.status(400).json({
        message: "Tên thể loại không được để trống!",
      });
    }

    const pool = await poolPromise;

    await pool
      .request()
      .input("TenTheLoai", sql.NVarChar(100), TenTheLoai.trim()).query(`
        INSERT INTO TheLoai (TenTheLoai)
        VALUES (@TenTheLoai)
      `);

    res.json({
      message: "Thêm thể loại thành công!",
    });
  } catch (error) {
    console.error("Lỗi thêm thể loại:", error);

    if (error.number === 2627) {
      return res.status(400).json({
        message: "Thể loại này đã tồn tại!",
      });
    }

    res.status(500).json({
      message: "Lỗi server!",
    });
  }
});
app.put("/api/theloai/:ma", async (req, res) => {
  try {
    const ma = parseInt(req.params.ma);

    const { TenTheLoai } = req.body;

    if (!TenTheLoai || TenTheLoai.trim() === "") {
      return res.status(400).json({
        message: "Tên thể loại không được để trống!",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("MaTheLoai", sql.Int, ma)
      .input("TenTheLoai", sql.NVarChar(100), TenTheLoai.trim()).query(`
          UPDATE TheLoai

          SET TenTheLoai = @TenTheLoai

          WHERE MaTheLoai = @MaTheLoai
        `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy thể loại!",
      });
    }

    res.json({
      message: "Sửa thể loại thành công!",
    });
  } catch (error) {
    console.error("Lỗi sửa thể loại:", error);

    if (error.number === 2627) {
      return res.status(400).json({
        message: "Tên thể loại này đã tồn tại!",
      });
    }

    res.status(500).json({
      message: "Lỗi server!",
    });
  }
});
app.delete("/api/theloai/:ma", async (req, res) => {
  try {
    const ma = parseInt(req.params.ma);

    const pool = await poolPromise;

    const result = await pool.request().input("MaTheLoai", sql.Int, ma).query(`
          DELETE FROM TheLoai
          WHERE MaTheLoai = @MaTheLoai
        `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Không tìm thấy thể loại!",
      });
    }

    res.json({
      message: "Xóa thể loại thành công!",
    });
  } catch (error) {
    console.error("Lỗi xóa thể loại:", error);

    res.status(500).json({
      message: "Không thể xóa thể loại!",
    });
  }
});

//them tk
app.post("/api/taikhoan", async (req, res) => {
  try {
    const { HoTen, SoDienThoai, MatKhau } = req.body;

    // Kiểm tra dữ liệu
    if (!HoTen || !SoDienThoai || !MatKhau) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin!",
      });
    }

    // Kết nối SQL Server
    const pool = await poolPromise;

    // Kiểm tra số điện thoại đã tồn tại
    const checkAccount = await pool
      .request()
      .input("SoDienThoai", sql.NVarChar(20), SoDienThoai).query(`
        SELECT MaTaiKhoan
        FROM TaiKhoan
        WHERE SoDienThoai = @SoDienThoai
      `);

    if (checkAccount.recordset.length > 0) {
      return res.status(400).json({
        message: "Số điện thoại đã tồn tại!",
      });
    }

    // Thêm tài khoản
    await pool
      .request()
      .input("HoTen", sql.NVarChar(100), HoTen)
      .input("SoDienThoai", sql.NVarChar(20), SoDienThoai)
      .input("MatKhau", sql.NVarChar(255), MatKhau).query(`
        INSERT INTO TaiKhoan
        (
          HoTen,
          SoDienThoai,
          MatKhau
        )
        VALUES
        (
          @HoTen,
          @SoDienThoai,
          @MatKhau
        )
      `);

    res.json({
      message: "Thêm tài khoản thành công!",
    });
  } catch (error) {
    console.error("LỖI THÊM TÀI KHOẢN:", error);

    res.status(500).json({
      message: "Lỗi khi thêm tài khoản!",
      error: error.message,
    });
  }
});
app.get("/api/doanhthu", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        p.TenPhim,
        p.AnhPhim,
        p.TrangThai,

        ISNULL(ve.SoVeBan, 0) AS SoVeBan,

        ISNULL(dt.TongDoanhThu, 0) AS TongDoanhThu

      FROM Phim p

      LEFT JOIN
      (
        -- ĐẾM SỐ VÉ
        SELECT
          sc.TenPhim,
          COUNT(cd.MaChiTiet) AS SoVeBan

        FROM SuatChieu sc

        INNER JOIN DatVe dv
          ON sc.MaSuatChieu = dv.MaSuatChieu

        INNER JOIN ChiTietDatVe cd
          ON dv.MaDatVe = cd.MaDatVe

        WHERE dv.TrangThai = N'Đã đặt'

        GROUP BY sc.TenPhim

      ) ve
        ON p.TenPhim = ve.TenPhim

      LEFT JOIN
      (
        -- TÍNH DOANH THU
        SELECT
          sc.TenPhim,
          SUM(dv.TongTien) AS TongDoanhThu

        FROM SuatChieu sc

        INNER JOIN DatVe dv
          ON sc.MaSuatChieu = dv.MaSuatChieu

        WHERE dv.TrangThai = N'Đã đặt'

        GROUP BY sc.TenPhim

      ) dt
        ON p.TenPhim = dt.TenPhim

      ORDER BY p.TenPhim
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("LỖI LẤY DOANH THU:", error);

    res.status(500).json({
      message: "Không thể lấy dữ liệu doanh thu!",
      error: error.message,
    });
  }
});
// ==========================================
// API SỬA MẬT KHẨU TÀI KHOẢN
// ==========================================

app.put("/api/taikhoan/:id/matkhau", async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.id);
    const { MatKhau } = req.body;

    if (!MatKhau || MatKhau.trim() === "") {
      return res.status(400).json({
        message: "Mật khẩu không được để trống!",
      });
    }

    const pool = await poolPromise;

    // Kiểm tra tài khoản có tồn tại không
    const checkAccount = await pool
      .request()
      .input("MaTaiKhoan", sql.Int, maTaiKhoan).query(`
        SELECT MaTaiKhoan, HoTen
        FROM TaiKhoan
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    if (checkAccount.recordset.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản!",
      });
    }

    // Cập nhật mật khẩu
    await pool
      .request()
      .input("MaTaiKhoan", sql.Int, maTaiKhoan)
      .input("MatKhau", sql.NVarChar(255), MatKhau).query(`
        UPDATE TaiKhoan
        SET MatKhau = @MatKhau
        WHERE MaTaiKhoan = @MaTaiKhoan
      `);

    res.json({
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    console.error("LỖI SỬA MẬT KHẨU:", error);

    res.status(500).json({
      message: "Không thể sửa mật khẩu tài khoản!",
      error: error.message,
    });
  }
});
