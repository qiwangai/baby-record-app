# 宝宝记录 App

这是一个独立的宝宝记录 PWA，可以部署后在手机上“添加到主屏幕”。

## 本地运行

```bash
npm install
npm run dev -- -p 3010
```

打开：

```text
http://localhost:3010/baby
```

## 上线

推荐用 Vercel：

1. 把这个文件夹上传到 GitHub。
2. 在 Vercel 导入项目。
3. Build Command 使用 `npm run build`。
4. 部署后访问 `/baby`。

## 手机安装

- iPhone：用 Safari 打开线上 `/baby`，分享，添加到主屏幕。
- Android：用 Chrome 打开线上 `/baby`，菜单，安装应用。
