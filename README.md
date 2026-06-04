# 方言录音众包采集平台

基于 Django + React Native + PostgreSQL 的方言录音众包采集系统。用户通过移动端 App 朗读指定文本并上传方言录音，系统自动检测音量质量，管理员审核后统计各省采集进度。

## 系统架构

```
┌─────────────────┐        ┌──────────────────────┐        ┌────────────┐
│  React Native   │  HTTP  │   Django REST API     │        │ PostgreSQL │
│  (Expo App)     │◄──────►│   + Volume Detection  │◄──────►│  Database  │
└─────────────────┘        └──────────────────────┘        └────────────┘
```

## 功能特性

- **录音采集**：用户按系统提示朗读指定文本，录制方言音频并上传
- **音量检测**：后端使用 pydub 自动分析音频音量，低于 -40 dBFS 自动拒绝
- **管理员审核**：管理员可审核录音，标记为有效或无效
- **省份进度地图**：SVG 地图可视化展示全国 34 个省份的采集进度
- **贡献者排行**：统计每位用户的有效录音数量，展示排行榜
- **JWT 认证**：安全的用户注册、登录、令牌刷新机制

## 项目结构

```
├── backend/                    # Django 后端
│   ├── dialect_platform/       # 项目配置
│   ├── accounts/               # 用户认证模块
│   ├── recordings/             # 录音核心模块
│   │   ├── models.py           # 省份、文本、录音、审核模型
│   │   ├── views.py            # API 视图
│   │   ├── utils.py            # 音量检测工具
│   │   └── fixtures/           # 初始数据（省份、文本）
│   └── requirements.txt
└── frontend/                   # React Native 前端
    ├── App.js
    └── src/
        ├── screens/            # 7 个页面
        ├── components/         # 可复用组件
        ├── api/                # API 客户端
        ├── context/            # 认证上下文
        └── navigation/         # 导航配置
```

## 后端部署

### 环境要求

- Python 3.10+
- PostgreSQL 14+
- FFmpeg（pydub 依赖）

### 安装步骤

```bash
cd backend

# 创建虚拟环境
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 配置数据库（修改 dialect_platform/settings.py 中的 DATABASES）
# 创建 PostgreSQL 数据库: CREATE DATABASE dialect_platform;

# 迁移数据库
python manage.py makemigrations accounts recordings
python manage.py migrate

# 加载初始数据
python manage.py loaddata provinces reading_texts

# 创建管理员
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver 0.0.0.0:8000
```

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register/` | 用户注册 |
| POST | `/api/auth/login/` | 登录获取 JWT |
| POST | `/api/auth/refresh/` | 刷新令牌 |
| GET/PUT | `/api/auth/profile/` | 用户资料 |
| GET | `/api/provinces/` | 省份列表 |
| GET | `/api/texts/` | 朗读文本列表 |
| POST | `/api/recordings/` | 上传录音 |
| GET | `/api/recordings/` | 我的录音列表 |
| GET | `/api/admin/recordings/pending/` | 待审核录音（管理员） |
| POST | `/api/admin/recordings/{id}/review/` | 审核录音（管理员） |
| GET | `/api/stats/province-progress/` | 省份进度统计 |
| GET | `/api/stats/leaderboard/` | 贡献者排行榜 |

## 前端部署

### 环境要求

- Node.js 18+
- Expo CLI

### 安装步骤

```bash
cd frontend

# 安装依赖
npm install

# 启动 Expo 开发服务器
npx expo start
```

### 配置后端地址

修改 `frontend/src/api/client.js` 中的 `API_BASE_URL`：

- Android 模拟器：`http://10.0.2.2:8000/api`
- iOS 模拟器：`http://localhost:8000/api`
- 真机调试：`http://<你的电脑IP>:8000/api`

## 核心流程

### 录音上传流程

1. 用户在 RecordingScreen 选择/查看指定朗读文本
2. 点击录音按钮开始录制（使用 expo-av）
3. 录制完成后点击上传
4. 后端接收音频文件，调用 pydub 分析音量
5. 音量 >= -40 dBFS → 标记合格，状态设为"待审核"
6. 音量 < -40 dBFS → 自动拒绝并返回提示

### 管理员审核流程

1. 管理员通过 Django Admin 或 API 查看待审核录音
2. 试听录音内容
3. 标记为"通过"或"拒绝"，可附加审核意见
4. 通过的录音计入省份进度和用户有效录音数

## 音量检测配置

在 `backend/dialect_platform/settings.py` 中调整阈值：

```python
VOLUME_THRESHOLD_DB = -40.0  # dBFS，低于此值判定为音量不合格
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | Django 4.2 + Django REST Framework |
| 认证 | djangorestframework-simplejwt (JWT) |
| 数据库 | PostgreSQL |
| 音频处理 | pydub + FFmpeg |
| 前端框架 | React Native (Expo) |
| 录音 | expo-av |
| 地图可视化 | react-native-svg |
| 安全存储 | expo-secure-store |
| 网络请求 | Axios |
