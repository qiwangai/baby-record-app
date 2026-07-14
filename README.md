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

### GitHub Pages

这个项目已经配置了 GitHub Pages 自动部署。推送到 `main` 后，GitHub Actions 会自动构建并发布。

发布地址：

```text
https://qiwangai.github.io/baby-record-app/baby/
```

### Vercel

也可以用 Vercel：

1. 把这个文件夹上传到 GitHub。
2. 在 Vercel 导入项目。
3. Build Command 使用 `npm run build`。
4. 部署后访问 `/baby`。

## 手机安装

- iPhone：用 Safari 打开线上 `/baby`，分享，添加到主屏幕。
- Android：用 Chrome 打开线上 `/baby`，菜单，安装应用。
