<p align="center"> 
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:25D366,100:075E54&height=220&section=header&text=WhatsApp%20Clone&fontSize=45&fontColor=ffffff&animation=fadeIn&desc=Real-time%20Chat%20Application&descAlignY=75" alt="WhatsApp Clone Header" /> 
</p> 

<p align="center"> 
  <img src="https://readme-typing-svg.herokuapp.com?color=00FFAA&size=26&center=true&vCenter=true&width=800&lines=Real-time+Messaging+with+Socket.IO;MERN+Stack+Project;Scalable+Chat+Architecture;WhatsApp+UI+Clone;Full-Stack+Realtime+System" alt="Typing SVG" /> 
</p>

<div align="center">

🏆 **Badges**

<img src="https://img.shields.io/badge/MERN-Stack-4CAF50?style=for-the-badge&logo=mongodb"/>
<img src="https://img.shields.io/badge/Realtime-Socket.IO-black?style=for-the-badge&logo=socket.io"/>
<img src="https://img.shields.io/badge/Deployed-Vercel-blue?style=for-the-badge&logo=vercel"/>
<img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge"/>

**[🌍 Live App](https://whatsapp-gilt-alpha.vercel.app)** • **[💻 GitHub Repository](https://github.com/suvojitmanna/whatsApp_clone)**

</div>

---

## 🧠 Project Overview

A scalable real-time chat application inspired by WhatsApp, built with the **MERN stack and Socket.IO**. This project enables seamless, instant bi-directional communication with live user presence tracking and a highly responsive modern UI.

### ✨ Core Highlights
* **⚡ Real-time bi-directional messaging**
* **🟢 Live user presence tracking** (Online/Offline status)
* **🔐 Secure authentication** via JWT
* **💬 Modern WhatsApp-like UI**
* **📡 Event-driven architecture**

---

## 🧱 Tech Stack

<p align="center"> 
  <img src="https://skillicons.dev/icons?i=mongodb,express,react,nodejs,tailwind" alt="MERN Stack" /> 
</p>

---

## 🖼️ Demo Preview

<div align="center">
  <img width="100%" alt="WhatsApp Clone Demo" src="https://github.com/user-attachments/assets/f51b131c-e1de-496a-9e30-e941f7987bcd" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
</div>

---

## 🔥 Features

### 💬 Messaging
* Instant message delivery (Powered by Socket.IO)
* Typing indicators *(Planned)*
* Read receipts *(Extendable architecture)*

### 🧑‍🤝‍🧑 User System
* JWT Authentication & Authorization
* Real-time online/offline presence
* Secure user session handling

### 🎨 UI/UX
* Premium WhatsApp-inspired interface
* Fully responsive design for desktop and mobile
* Smooth, frictionless chat experience

---

## 🏗️ Architecture & System Design

### 🧠 System Design (High-Level)
flowchart LR
    U[👤 User] --> F[⚛️ React Frontend]
    F -->|REST API| B[🟢 Express Backend]
    B --> DB[(🍃 MongoDB)]
    B --> S[⚡ Socket.IO Server]
    S -->|WebSocket| F
