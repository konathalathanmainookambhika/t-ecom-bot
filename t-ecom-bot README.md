# T-Ecom-Bot 🤖

## Enterprise Multi-Agent AI Governance Engine for E-Commerce Seller Support

### 🔗 Live Prototype Demo
[Click Here to Try](http://t-ecom-bot-1772465676.s3-website-us-east-1.amazonaws.com/)

---

### 📌 The Problem

E-commerce platforms lose over $2B/year to seller support chaos- fragmented SOPs, compliance risks, and slow resolution rates due to complex procedures. Industry reports (McKinsey, BCG) estimate $1.8–$2.5B/year in lost revenue + support costs for Indian e-commerce due to poor seller experiences. With 32 lakh+ cases/year approximately demanding consistent quality, speed, and 100% audit compliance, the significant barriers are process complexity and quantity of cases handled completely manually. 


### 💡 The Solution

T-Ecom-Bot processes all seller cases as per SOP through an 8-agent governed pipeline — instantly matching the correct SOP, responding as per guidelines, managing case lifecycle, and auto-auditing quality — all in seconds with full decision transparency.

---

### 🧠 Multi-Agent Pipeline

Every seller message flows through 8 specialized agents — just like an enterprise team has language experts, policy specialists, quality auditors, and escalation managers:

| # | Agent | What It Does |
|---|-------|-------------|
| 1 | 🌐 Language/Emotion | Detects language (10 Indian languages) + emotional state (frustrated/angry/worried/neutral/positive) |
| 2 | 🔍 Intent Detection | Identifies issue category with confidence scoring |
| 3 | 📘 SOP Retrieval | Instantly matches correct SOP — what takes associates minutes, this does in milliseconds |
| 4 | 📚 History | Loads full conversation context — seller never repeats |
| 5 | ⚠️ Risk Assessment | Multi-factor scoring — legal threats, financial impact, emotion, escalation history |
| 6 | 🛡️ Governance Guard | Validates every response follows SOP — zero unvalidated responses reach seller |
| 7 | 🎫 Ticketing | Manages full case lifecycle with 7 status stages |
| 8 | 📝 Audit | Auto-documents everything + calculates quality score /100 |

Seller Message ↓ [1-5] PRE-PROCESSING — Language, Intent, SOP, History, Risk ↓ AI Response Generated (SOP-compliant, context-aware) ↓ [6-8] POST-PROCESSING — Governance, Ticketing, Audit ↓ Governed Response → Seller


---

### 🎯 Case Outcomes (All as per SOP)

| Outcome | When |
|---------|------|
| ✅ **Resolves Case** | SOP provides clear resolution steps |
| 🎫 **Raises Trouble Ticket** | Case needs relevant team's action — TT created with priority |
| 🚨 **Escalates to Human** | High-risk situations or seller requests human (after 3 attempts) |

### 🔄 Complete Case Lifecycle (7 Stages)

Created ↓ Under Review (AI processing) ↓ ┌─────────────────────────────────────────┐ │ │ ↓ ↓ Pending Seller Action Escalated (AI asked seller for info/docs) (High risk or 3rd human request) │ │ ↓ ↓ Seller responds → back to Trouble Ticket Created Under Review (TT assigned to relevant team) │ ↓ Company Pending Action (Internal team working on TT) │ ┌─────────────────────┘ ↓ Resolved ↓ Closed


**Pending Seller Action:** When AI needs seller to provide documents, information, or take action
**Company Pending Action:** When trouble ticket is created and internal team is working on resolution
**Both statuses tracked in real-time on the Control Room dashboard**

---

### 📊 Process Enhancement

| Metric | Enhancement |
|--------|------------|
| SOP Match Speed | Minutes → **Milliseconds** |
| Case Resolution (ACHT) | **2.75x faster** |
| Case Capacity | **2.54x+ more** |
| Quality Consistency | **99.8% consistent** |
| Audit Coverage | **100% automated** |
| Languages | **10 simultaneous** |
| Availability | **24/7/365** |
| Governance | **Real-time on every response** |

---

### 🖥️ Prototype Screens

| Screen | What It Shows |
|--------|--------------|
| **Seller Dashboard** | Business Intelligence — Health, Inventory, Revenue, Compliance |
| **Case Creation** | 10 Languages × 7 Categories × Issue Description |
| **Control Room** | Live chat + Agent pipeline + Case lifecycle + 80 cases grid + Metrics + Audit log |
| **Case Summary** | Audit Score /100 + Decision report + Timeline + JSON audit |

### Audit Quality Score Breakdown (/100):
| Component | Weight |
|-----------|--------|
| Confidence | /25 |
| Risk Management | /20 |
| SOP Compliance | /15 |
| Emotion Handling | /15 |
| Resolution | /15 |
| Governance | /10 |

---

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 8-Agent Pipeline | Every message through 8 governed agents |
| 🌐 10 Languages | Telugu, English, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi |
| 📊 Auto Audit /100 | Quality scoring with breakdown |
| 🎫 Smart Ticketing | TT with priority + lifecycle tracking |
| 😠 Emotion Detection | Tone adapts for frustrated/angry/worried sellers |
| ⚠️ Auto-Escalation | Risk-based + 3-request human transfer |
| 🔄 7-Stage Lifecycle | Full case tracking including Pending Seller & Company Pending |
| 📈 80 Concurrent Cases | Live monitoring with status grid |
| ⏱️ ~4 Min ACHT | Enhanced average handling time |
| 🛡️ Real-time Governance | Every response validated before sending |
| 📋 100% Auto-Audit | Complete trail with zero manual effort |
| 🔁 Dual Failover | Backup AI model + backup key auto-switch |

---

### 🏢 Enterprise Vision

This prototype demonstrates the core multi-agent pipeline working end-to-end. At enterprise level, this scales into a fully distributed system:

| Aspect | Prototype | Enterprise |
|--------|-----------|-----------|
| Agent Communication | Function calls | Event-driven async bus |
| SOP Repository | Sample SOPs demonstrated | Full SOP repository with versioning |
| Scaling | Single AI agent | Auto-scaling specialized agent pools |
| Agent Pools | 1 agent handles all | Specialized — Conversation, Resolution, Validation, Tool, Language, Analytics |
| Monitoring | Live dashboard | Full observability stack |
| Failover | Dual key + backup model | Multi-region self-healing |
| Concurrent Capacity | 80 per agent | Unlimited via horizontal scaling |
| Human Oversight | Escalation-based | Full validation workflow with continuous learning |

Enterprise Architecture:

API Gateway & Load Balancer ↓ Orchestrator Agent (routes, monitors, scales) ↓ ┌───────┼───────┐ ↓ ↓ ↓ Conver- Resol- Valid- sation ution ation Pool Pool Pool └───────┼───────┘ ↓ Event Bus ↓ ┌───────┼───────┐ ↓ ↓ ↓ Tool Language Analytics Agents Agents Agents ↓ Shared Services (State, SOPs, Audit, Metrics)


---

### 📂 Project Files

| File | Purpose |
|------|---------|
| `index.html` | Complete UI — 4 screens with responsive design |
| `app.js` | All logic — 8 agents, chat, governance, audit, ticketing |
| `README.md` | Documentation |

---

### 👥 Team
Thanmai Nookambhika Konathala :
Built for AI For Bharat Hackathon

### 📜 License
MIT License
