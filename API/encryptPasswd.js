const bcrypt = require('bcrypt');

(async () => {
    const password = 'admin';
    const salt = await bcrypt.genSalt(10);
    const encryptPasswd = await bcrypt.hash(password, salt);
    
    console.log(encryptPasswd);
})();

// 加盐就是为了即便输入的是正确密码，但是每次加密出来的内容都不相同
// 如果不相同，那么比对不就是错误的吗？
// 并非如此，如果两个哈希值完全一致，bcrypt.compare() 就会返回 true，表示密码正确。
// 通过这种机制，bcrypt 既保证了安全性(因为无法通过反向计算来得到原始密码)，又实现了准确的密码比对。

// 什么是盐（Salt）？
// 盐是一个随机生成的数据串。在加密密码时，bcrypt 会将你的原始密码和这个随机生成的盐值混合在一起，然后再进行哈希计算。因为每一次生成的盐都是不同的，所以即使是同一个密码，每次加密后得到的哈希值也都不一样。
// 例如：
// bcrypt.hash('admin', salt_A) → $2a$10$salt_A.xxxxxxxxxxxxxxxxxxxxxx
// bcrypt.hash('admin', salt_B) → $2a$10$salt_B.yyyyyyyyyyyyyyyyyyyyyy

// bcrypt 是如何进行比对的？
// bcrypt 在进行密码比对时，并不需要存储原始的盐值。它将盐值和加密后的密码（哈希值）合并存储在一个字符串中。
// 例如，一个完整的 bcrypt 哈希字符串看起来像这样：
// $2a$10$EExQeT95lR891n09g8lX8.gI/35.x
// 这个字符串包含了所有必要的信息：
// $2a$: 哈希算法版本。
// $10$: 哈希迭代次数（强度）。
// EExQeT95lR891n09g8lX8.: 这就是盐值，bcrypt 将其从哈希字符串中提取出来。
// gI/35.x: 这是加密后的密码哈希值。
// 当你调用 bcrypt.compare() 方法时，它会执行以下步骤：
// 从数据库中获取完整的哈希字符串。
// 从哈希字符串中提取出盐值。
// 将用户输入的明文密码，与提取出的同一个盐值混合。
// 重新对这个混合后的数据进行哈希计算。
// 将新生成的哈希值，与数据库中存储的哈希值进行比较。
// 如果两个哈希值完全一致，bcrypt.compare() 就会返回 true，表示密码正确。