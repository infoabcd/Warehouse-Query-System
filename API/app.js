const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const indexRoute = require('./routes/index');
const searchRoute = require('./routes/search');
const mediaRoute = require('./routes/media');
const adminRoute = require('./routes/admin');

const { checkLogin } = require('./middleware/verify');  // 解构导入，因为 middleware/verify 有两个方法，结构后导出了。

// 通用导入
const app = express();
const PORT = 3000;

// // CORS - 这个在前面，是因为它的优先度更高，需要确认是否应该放行你。这就像(routes/)路由 '/' 应该放在其他路由下面一样。最后才进行 '/' 匹配。
// app.use(
//     cors({
//         origin: '*',
//         credentials: true,
//     })
// );

// 在开发后期，我们遇到了设置Cookie问题(res.Cookie)
// 如果你设置了 credentials: true，那么 origin 就不能再是 * 通配符了，必须是确切的前端地址。
// 否则浏览器是不会接管 Token 的，会认为是跨域。不要以 / 结尾
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        // 后端：“我允许来自这个特定域的请求携带凭证。”
        // 对应前端 fetch 的 credentials: 'include'
        // 前端：“我希望这次请求包含我的凭证（cookie）。”
        // 而在有需要验证的 fetch 也记得带上这个参数。
        // 这个参数会告诉浏览器带上token去fetch。
        // 否则中间件依旧会因为找不到token而拦下你。
    })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// 全局中间件 - 检查登陆情况，如果登陆了就返回 role
// app.use(checkLogin);                                     <<<<<================。 // 在 v1.0.1 弃用
// 在开发后期，我们会发现每个路由，每次访问都放回「未登陆」真的很烦
// 我们只需要在 /login，/products判断是否登陆
// 所以我们注释掉全局中间件，在 /products 套用中间件，在 特定路由 也可以先套用验证登陆中间件，再套用验证管理员中间件
// —— 但是！这也意味着，我们曾经修改过的路由(如果已经登陆就返回更加详细的信息)全部不再起作用，因为只有商品详细的/products路由判断得了是否已经登陆
// 所以会出现一些没有删除的 const role = req.user?.role; 和其附属逻辑，看懂即可。
// 这是因为在后期开发，发现主页等其他路由根本不需要列出如此详细的信息，即便是对于管理员，也不需要(具体看项目和你自己)

app.use('/', indexRoute);
app.use('/search', searchRoute);
app.use('/media', mediaRoute);
app.use('/admin', adminRoute);

app.listen(PORT, () => {
    console.log(`服务已经启动到 http://localhost:${PORT}`);
});
