const express = require('express');
const router = express.Router();
const multer = require('multer');       // 需要一个能够处理 multipart/form-data 类型请求的中间件，因为浏览器在上传文件时会使用这种格式。最流行和强大的选择是 multer
const path = require('path');           // 构建图片存储目录用
const fs = require('fs');

// 本路由只作上传，不必进行数据库操作
// 数据库操作交由 /admin 路由，此路由返回上传完毕的图片path，之后由 /admin 路由写回数据库

const { verifyAdmin } = require('../middleware/verify');

// 设置图片存储目录
const imagesDir = path.join(__dirname, '../uploads/images');

// // 其实对于提供静态文件，Express 有一个内置的中间件 express.static()，它比手动编写路由更高效、更安全。它会自动处理文件的缓存、ETag 等，并且能够防止目录遍历攻击。
// // 配合 设置图片存储目录，用户就可以通过访问 /images/photo.jpg 来获取 /uploads/images/photo.jpg 文件。你不再需要手动编写 GET 路由，Express 会自动处理所有请求。
// router.use('/images', express.static(imagesDir));

// GET 图片路由
router.get('/images/:fileName', async(req, res) => {
    const fileName = req.params.fileName;
    const imageUrl = path.join(imagesDir, fileName);    // 手动拼合 图片URL，使用它不够安全。
    
    // res.sendFile 本身是异步的，但它不返回一个 Promise，而是接受一个回调函数来处理错误。因此，使用 try...catch 块捕获 res.sendFile 的错误可能不会生效。
    // res.sendFile(fileName, { root: imagesDir }, (err) => {
    // 通过使用 { root: imagesDir }，你告诉 res.sendFile 从 imagesDir 这个根目录开始查找 fileName，这样可以确保路径的绝对性，并提升安全性。
    // 不使用 root 的潜在风险：如果你不指定 root，res.sendFile() 会直接使用你传入的绝对路径。如果 fileName 中包含恶意路径（如 ../../../../etc/passwd），你的代码可能会返回敏感文件。
    // 因为我们已经拼合了 图片URL，所以这样也是可以的：res.sendFile(imageUrl, (err) => { 「只是不够安全」
    // 所以，更好的实践是：
    res.sendFile(fileName, { root: imagesDir }, (err) => {
        if (err) {
            console.error('图片发送出错:', err);
            res.status(500).json({ message: '服务器内部错误.' });
        }
    });
});

// 配置 Multer 存储定义
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);                                                            // 确定文件存储的目录
    },
    filename: function (req, file, cb) {
        // 设置文件名，避免重复。这里使用时间戳作为文件名的一部分。
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);        // 定义(获得)时间戳
        const fileExtension = path.extname(file.originalname);                          // 定义(获得)文件后缀名
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);                  // 写入文件，格式：文件名-时间戳.后缀
    }
});
// 配置上传
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 限制文件大小为 5MB
    fileFilter: (req, file, cb) => {
        // 过滤文件类型，只允许图片文件
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);                                 // 文件类型
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());  // 文件后缀

        if (mimetype && extname) {              // 如果「文件类型」和「后缀扩展名」正确存在
            return cb(null, true);
        }
        cb('错误：文件上传仅支持以下文件类型 -' + filetypes);
    }
});

// POST 图片上传路由
// 无需 async 操作，因为
// upload.single('image') 是一个 multer 中间件，它已经完成了文件上传这个异步操作。当路由处理函数 (req, res) => { ... } 被调用时，文件已经上传完成，并且 req.file 对象已经准备好。
// 而处理函数内部，没有进行任何需要 await 的异步操作（比如数据库操作、文件读写等）。因此，这里的 async 是多余的，没有发挥任何作用。
router.post('/upload', verifyAdmin, upload.single('image'), (req, res) => {
    // verifyAdmin 是第一个执行的中间件，upload.single('image') 是第二个执行的中间件，它会在路由处理函数之前运行
    // single() 表示只上传一个文件。如果需要上传多个文件，可以使用 array() 或 fields()
    // 'image' 必须和前端表单中 <input type="file" name="image"> 的 name 属性值保持一致
    try {
        if (!req.file) {                // req.file: multer 中间件处理完文件后，会将文件的相关信息(如文件名、路径等)添加到 req.file 对象中，可以在路由处理函数中直接访问它
            return res.status(400).json({ message: '未找到上传文件。' });
        }
        
        res.status(200).json({
            message: '文件上传成功！',
            fileName: req.file.filename,
            filePath: `media/images/${req.file.filename}`   // 返回 app.js 定义的路由路径。但写入数据库只写入文件名(fileName)就好。
        });

    } catch (error) {
        console.error('文件上传出错:', error);
        res.status(500).json({ message: '服务器内部错误。' });
    } 
});

module.exports = router;

// Upload API 调用 - 在前端，需要使用 FormData 对象来上传文件
{/* <input type="file" name="image" id="fileInput">
<button onclick="uploadFile()">Upload</button>

<script>
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('请选择一个文件！');
        return;
    }

    const formData = new FormData();
    // 这里的 'image' 必须和 Express 路由中的 'image' 保持一致
    formData.append('image', file);

    try {
    // 路由反向代理到 /api
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('Success:', result);
        alert('上传成功！');                            // 成功后的更多逻辑，否则即便成功了，页面也是一成不变的。
        } catch (error) {
            console.error('Error:', error);
            alert('上传失败！');                        // 失败后的更多逻辑，否则即便失败了，页面也是一成不变的。
    }
}
</script> */}