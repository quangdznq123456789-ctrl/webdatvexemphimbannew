USE web_dat_ve;

CREATE TABLE Phim (
    AnhPhim NVARCHAR(500),
    TenPhim NVARCHAR(255) NOT NULL PRIMARY KEY,
    DaoDien NVARCHAR(255),
    DienVien NVARCHAR(500),
    TheLoai NVARCHAR(100),
    KhoiChieu DATE,
    ThoiLuong INT,
    Ngonngu nvarchar(50), 
    rated nvarchar(50),
    noidung nvarchar(MAX)
);
ALTER TABLE Phim
ADD TrangThai NVARCHAR(50) NOT NULL
    CONSTRAINT DF_Phim_TrangThai
    DEFAULT N'Hoạt động';

ALTER TABLE Phim
ADD Trailer NVARCHAR(500) NULL;

UPDATE Phim
SET Trailer = N'https://www.youtube.com/watch?v=2w8tCggbkNw'
WHERE TenPhim = N'SIÊU CHÓ ĐẠP GIÓ ĐÓN LỄ';

select * from Phim

USE web_dat_ve;

SELECT * FROM Phim;

DELETE FROM Phim;




USE web_dat_ve;

CREATE TABLE TaiKhoan (
    MaTaiKhoan INT IDENTITY(1,1) PRIMARY KEY,

    HoTen NVARCHAR(100) NOT NULL,

    SoDienThoai NVARCHAR(20) NOT NULL UNIQUE,

    MatKhau NVARCHAR(255) NOT NULL,

    VaiTro NVARCHAR(20) NOT NULL DEFAULT N'User',

    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),

    TrangThai NVARCHAR(50) NOT NULL DEFAULT N'Hoạt động'
);

INSERT INTO TaiKhoan(HoTen,SoDienThoai,MatKhau,VaiTro)
VALUES (N'Quản trị viên','0367265164','daylaamin123',N'Admin');


select * from DatVe;

delete from DatVe

UPDATE TaiKhoan
SET VaiTro = N'Khách Hàng'
WHERE VaiTro = N'User';

SELECT 
    dc.name AS TenConstraint
FROM sys.default_constraints dc
JOIN sys.columns c
    ON dc.parent_object_id = c.object_id
    AND dc.parent_column_id = c.column_id
WHERE OBJECT_NAME(dc.parent_object_id) = 'TaiKhoan'
AND c.name = 'VaiTro';

ALTER TABLE TaiKhoan
DROP CONSTRAINT DF__TaiKhoan__VaiTro__5DCAEF64;

ALTER TABLE TaiKhoan
ADD CONSTRAINT DF_TaiKhoan_VaiTro
DEFAULT N'Khách hàng' FOR VaiTro;



CREATE TABLE PhongChieu (
    MaPhong INT IDENTITY(1,1) PRIMARY KEY,

    TenPhong NVARCHAR(100) NOT NULL,

    SoLuongGhe INT NOT NULL
);

select * from PhongChieu
delete PhongChieu
delete SuatChieu
DELETE DatVe
DELETE ChiTietDichVu

DELETE FROM PhongChieu
WHERE MaPhong BETWEEN 27 AND 37;

CREATE TABLE Ghe (
    MaGhe INT IDENTITY(1,1) PRIMARY KEY,

    MaPhong INT NOT NULL,

    SoGhe NVARCHAR(10) NOT NULL,

    LoaiGhe NVARCHAR(50) NOT NULL DEFAULT N'Thường',

    CONSTRAINT FK_Ghe_Phong
        FOREIGN KEY (MaPhong)
        REFERENCES PhongChieu(MaPhong),

    CONSTRAINT UQ_Ghe_Phong
        UNIQUE (MaPhong, SoGhe)
);




USE web_dat_ve;

DELETE FROM ChiTietDatVe;
DELETE FROM Ghe;

CREATE TABLE SuatChieu (
    MaSuatChieu INT IDENTITY(1,1) PRIMARY KEY,

    TenPhim NVARCHAR(255) NOT NULL,

    MaPhong INT NOT NULL,

    NgayChieu DATE NOT NULL,

    GioChieu TIME NOT NULL,

    CONSTRAINT FK_SuatChieu_Phim
        FOREIGN KEY (TenPhim)
        REFERENCES Phim(TenPhim),

    CONSTRAINT FK_SuatChieu_Phong
        FOREIGN KEY (MaPhong)
        REFERENCES PhongChieu(MaPhong),

    CONSTRAINT UQ_SuatChieu
        UNIQUE (MaPhong, NgayChieu, GioChieu)
);
INSERT INTO SuatChieu
(TenPhim, MaPhong, NgayChieu, GioChieu)
VALUES
(N'CHIIKAWA: BÍ MẬT ĐẢO NGƯỜI CÁ',6,'2026-09-10','18:00'),
(N'CHIIKAWA: BÍ MẬT ĐẢO NGƯỜI CÁ',7,'2026-09-10','20:30');

select * from SuatChieu




CREATE TABLE DatVe (
    MaDatVe INT IDENTITY(1,1) PRIMARY KEY,

    MaTaiKhoan INT NOT NULL,

    MaSuatChieu INT NOT NULL,

    NgayDat DATETIME NOT NULL DEFAULT GETDATE(),

    TongTien DECIMAL(12,2) NOT NULL,

    PhuongThucThanhToan NVARCHAR(50) NOT NULL,

    TrangThai NVARCHAR(50) NOT NULL DEFAULT N'Đã đặt',

    CONSTRAINT FK_DatVe_TaiKhoan
        FOREIGN KEY (MaTaiKhoan)
        REFERENCES TaiKhoan(MaTaiKhoan),

    CONSTRAINT FK_DatVe_SuatChieu
        FOREIGN KEY (MaSuatChieu)
        REFERENCES SuatChieu(MaSuatChieu)
);




CREATE TABLE ChiTietDatVe (
    MaChiTiet INT IDENTITY(1,1) PRIMARY KEY,

    MaDatVe INT NOT NULL,

    MaSuatChieu INT NOT NULL,

    MaGhe INT NOT NULL,

    DonGia DECIMAL(12,2) NOT NULL,

    CONSTRAINT FK_ChiTietDatVe_DatVe
        FOREIGN KEY (MaDatVe)
        REFERENCES DatVe(MaDatVe),

    CONSTRAINT FK_ChiTietDatVe_SuatChieu
        FOREIGN KEY (MaSuatChieu)
        REFERENCES SuatChieu(MaSuatChieu),

    CONSTRAINT FK_ChiTietDatVe_Ghe
        FOREIGN KEY (MaGhe)
        REFERENCES Ghe(MaGhe),

    CONSTRAINT UQ_SuatChieu_Ghe
        UNIQUE (MaSuatChieu, MaGhe)
);
select * from ChiTietDatVe


CREATE TABLE DichVu (
    MaDichVu INT IDENTITY(1,1) PRIMARY KEY,

    TenDichVu NVARCHAR(255) NOT NULL,

    Gia DECIMAL(12,2) NOT NULL
);


INSERT INTO DichVu (TenDichVu, Gia)
VALUES
(N'Vé xem phim', 70000),
(N'Vé + Bỏng + Nước', 100000);


select * from DichVu
delete DichVu



CREATE TABLE Nuoc (
    MaNuoc INT IDENTITY(1,1) PRIMARY KEY,

    TenNuoc NVARCHAR(100) NOT NULL,

    Gia DECIMAL(12,2) NOT NULL
);


INSERT INTO Nuoc (TenNuoc, Gia)
VALUES
(N'Coca Cola', 30000),
(N'Pepsi', 30000),
(N'Sprite', 30000),
(N'7Up', 30000);

select * from Nuoc
delete Nuoc


CREATE TABLE ChiTietDichVu (
    MaChiTietDichVu INT IDENTITY(1,1) PRIMARY KEY,

    MaDatVe INT NOT NULL,

    MaDichVu INT NOT NULL,

    MaNuoc INT NULL,

    SoLuong INT NOT NULL DEFAULT 1,

    DonGia DECIMAL(12,2) NOT NULL,

    CONSTRAINT FK_ChiTietDichVu_DatVe
        FOREIGN KEY (MaDatVe)
        REFERENCES DatVe(MaDatVe),

    CONSTRAINT FK_ChiTietDichVu_DichVu
        FOREIGN KEY (MaDichVu)
        REFERENCES DichVu(MaDichVu),

    CONSTRAINT FK_ChiTietDichVu_Nuoc
        FOREIGN KEY (MaNuoc)
        REFERENCES Nuoc(MaNuoc)
);


select * from DatVe

select * from Ghe



USE web_dat_ve;
DELETE FROM ChiTietDichVu;
DELETE FROM ChiTietDatVe;
DELETE FROM DatVe;
DELETE FROM SuatChieu;
DELETE FROM Ghe;
DELETE FROM PhongChieu;

select * from DatVe


USE web_dat_ve;

INSERT INTO PhongChieu (TenPhong, SoLuongGhe)
VALUES
(N'Phòng 101', 50),
(N'Phòng 102', 50),
(N'Phòng 103', 50),
(N'Phòng 104', 50),
(N'Phòng 105', 50),
(N'Phòng 106', 50),
(N'Phòng 107', 50),
(N'Phòng 108', 50),
(N'Phòng 109', 50),
(N'Phòng 110', 50),
(N'Phòng 111', 50),
(N'Phòng 112', 50),
(N'Phòng 113', 50),
(N'Phòng 114', 50),
(N'Phòng 115', 50);


SELECT *
FROM PhongChieu
ORDER BY MaPhong;

DBCC CHECKIDENT ('PhongChieu', RESEED, 0);



USE web_dat_ve;

DECLARE @MaPhong INT = 1;

WHILE @MaPhong <= 15
BEGIN

    INSERT INTO Ghe (MaPhong, SoGhe, LoaiGhe)
    VALUES
    (@MaPhong, N'A1', N'Thường'),
    (@MaPhong, N'A2', N'Thường'),
    (@MaPhong, N'A3', N'Thường'),
    (@MaPhong, N'A4', N'Thường'),
    (@MaPhong, N'A5', N'Thường'),
    (@MaPhong, N'A6', N'Thường'),
    (@MaPhong, N'A7', N'Thường'),
    (@MaPhong, N'A8', N'Thường'),
    (@MaPhong, N'A9', N'Thường'),
    (@MaPhong, N'A10', N'Thường'),

    (@MaPhong, N'B1', N'Thường'),
    (@MaPhong, N'B2', N'Thường'),
    (@MaPhong, N'B3', N'Thường'),
    (@MaPhong, N'B4', N'Thường'),
    (@MaPhong, N'B5', N'Thường'),
    (@MaPhong, N'B6', N'Thường'),
    (@MaPhong, N'B7', N'Thường'),
    (@MaPhong, N'B8', N'Thường'),
    (@MaPhong, N'B9', N'Thường'),
    (@MaPhong, N'B10', N'Thường'),

    (@MaPhong, N'C1', N'Thường'),
    (@MaPhong, N'C2', N'Thường'),
    (@MaPhong, N'C3', N'Thường'),
    (@MaPhong, N'C4', N'Thường'),
    (@MaPhong, N'C5', N'Thường'),
    (@MaPhong, N'C6', N'Thường'),
    (@MaPhong, N'C7', N'Thường'),
    (@MaPhong, N'C8', N'Thường'),
    (@MaPhong, N'C9', N'Thường'),
    (@MaPhong, N'C10', N'Thường'),

    (@MaPhong, N'D1', N'VIP'),
    (@MaPhong, N'D2', N'VIP'),
    (@MaPhong, N'D3', N'VIP'),
    (@MaPhong, N'D4', N'VIP'),
    (@MaPhong, N'D5', N'VIP'),
    (@MaPhong, N'D6', N'VIP'),
    (@MaPhong, N'D7', N'VIP'),
    (@MaPhong, N'D8', N'VIP'),
    (@MaPhong, N'D9', N'VIP'),
    (@MaPhong, N'D10', N'VIP'),

    (@MaPhong, N'E1', N'VIP'),
    (@MaPhong, N'E2', N'VIP'),
    (@MaPhong, N'E3', N'VIP'),
    (@MaPhong, N'E4', N'VIP'),
    (@MaPhong, N'E5', N'VIP'),
    (@MaPhong, N'E6', N'VIP'),
    (@MaPhong, N'E7', N'VIP'),
    (@MaPhong, N'E8', N'VIP'),
    (@MaPhong, N'E9', N'VIP'),
    (@MaPhong, N'E10', N'VIP');

    SET @MaPhong = @MaPhong + 1;
END;



SELECT
    MaPhong,
    COUNT(*) AS SoGhe
FROM Ghe
GROUP BY MaPhong
ORDER BY MaPhong;




SELECT *
FROM Ghe
WHERE MaPhong = 6
ORDER BY
    LEFT(SoGhe, 1),
    TRY_CAST(SUBSTRING(SoGhe, 2, LEN(SoGhe)) AS INT);



CREATE TABLE TheLoai (
    MaTheLoai INT IDENTITY(1,1) PRIMARY KEY,
    TenTheLoai NVARCHAR(100) NOT NULL UNIQUE
);


select * from TheLoai

DELETE FROM TheLoai
WHERE MaTheLoai = 1003;

DBCC CHECKIDENT ('TheLoai', RESEED, 5);