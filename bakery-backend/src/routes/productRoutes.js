const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/products
// Tìm kiếm và lọc danh sách bánh
router.get("/", async (req, res) => {
  try {
    const { search, category_id, min_price, max_price } = req.query;

    // Xây dựng điều kiện SQL
    const conditions = ["status = 'active'"];
    const values = [];

    // 1. Tìm kiếm theo tên bánh
    if (search !== undefined && search.trim() !== "") {
      conditions.push("name LIKE ?");
      values.push(`%${search.trim()}%`);
    }

    // 2. Lọc theo danh mục
    if (category_id !== undefined) {
      const categoryId = Number(category_id);

      if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          message: "Invalid category_id",
        });
      }

      conditions.push("category_id = ?");
      values.push(categoryId);
    }

    // 3. Lọc theo giá tối thiểu
    if (min_price !== undefined) {
      const minPrice = Number(min_price);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return res.status(400).json({
          message: "Invalid min_price",
        });
      }

      conditions.push("price >= ?");
      values.push(minPrice);
    }

    // 4. Lọc theo giá tối đa
    if (max_price !== undefined) {
      const maxPrice = Number(max_price);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return res.status(400).json({
          message: "Invalid max_price",
        });
      }

      conditions.push("price <= ?");
      values.push(maxPrice);
    }

    // Kiểm tra khoảng giá
    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return res.status(400).json({
        message: "min_price cannot be greater than max_price",
      });
    }

    // Ghép câu truy vấn
    const sql = `
      SELECT
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        status,
        created_at
      FROM products
      WHERE ${conditions.join(" AND ")}
      ORDER BY id DESC
    `;

    const [products] = await pool.execute(sql, values);

    res.json({
      message: "Get products successfully!",
      total: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      message: "Cannot get products",
    });
  }
});

// GET /api/products/:id
// Lấy chi tiết một sản phẩm
router.get("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const [products] = await pool.execute(
      `SELECT
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        status,
        created_at
      FROM products
      WHERE id = ? AND status = 'active'`,
      [productId],
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Get product successfully!",
      data: products[0],
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      message: "Cannot get product",
    });
  }
});

module.exports = router;
