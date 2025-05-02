
# 🍕 Food Ordering & Restaurant Management System

This repository contains a web application designed for **ordering food online** and **restaurant order management**. It includes features such as user authentication, menu browsing, placing orders, online payments, and real-time order tracking.

---

## 🚀 Features

- ✅ **User Management**
  - Register, login, and manage user profiles securely.

- 📖 **Food Ordering**
  - Browse available menus, customize orders, and complete checkouts.

- 🗃️ **Order Management**
  - Monitor the status of orders: placed, preparing, and completed.

- 💳 **Payment Integration**
  - Secure online payments with integrated payment gateways.

- 📊 **Admin Dashboard**
  - Manage menus, orders, users, and view sales statistics.

---

## 🛠️ Technology Stack

- **Frontend:** React / Next.js, HTML, CSS, JavaScript
- **Backend:** Node.js / Express.js
- **Database:** PostgreSQL / MySQL
- **Deployment:** Docker, Docker Hub, Azure/DigitalOcean

---

## ⚙️ Development Setup

### 📌 **Prerequisites**

- [Node.js](https://nodejs.org/) (≥ 18.x recommended)
- [npm](https://npmjs.com/) (included with Node.js)
- [Docker](https://www.docker.com/) (for containerization)

### 💻 **Installation & Running in Dev Mode**

Clone repository and install dependencies:

```bash
git clone <https://github.com/leducthanhkim2004/HexaGrub.git>
cd <HexaGrub>
npm install
```
Pass Api Key 
```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

VNPAY_TMN_CODE=YOUR_TMN-CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=YOUR_VNPAY_URL
VNPAY_RETURN_URL=YOUR_RETURN-URL
    
```
Run development server:

```bash
npm run dev
```

The app runs at:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 🚦 Production Setup

### 🏗️ **Building the Application**

Build optimized app:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Our app runs at:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 📦 Docker Deployment

### 🛠️ **Dockerfile Included**

We have included a `Dockerfile` in this repository to streamline containerization.

### 🐳 **Build Docker Image**

Run this bash for container:

```bash
docker build -t restaurant-app -f restaurant.dockerfile .

```

### ▶️ **Run Docker Container**

Start your Docker container on port `3000`:

```bash
docker run -p 3000:3000 restaurant-app
```

Check the application at:  
👉 [http://localhost:3000](http://localhost:3000)

### 📌 **Docker Hub**

Docker image available on Docker Hub:  
👉 [https://hub.docker.com/r/10422105/hexagrub](https://hub.docker.com/r/10422105/hexagrub)

---

## 🌐 Website URL

The deployed application is accessible online at:

👉 [https://hexagrub-vgu.onrender.com](https://hexagrub-vgu.onrender.com)

---
---

## 📚 Documentation & Support
- For assistance, feel free to open an issue in this repository or contact the project maintainers.

---

**Happy coding! 🚀**
