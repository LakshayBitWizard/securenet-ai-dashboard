Project Overview
SecureNet AI is a deep learning–powered Intrusion Detection System (IDS) designed to detect and classify cyberattacks in real time.
It leverages ResNet architecture to overcome the limitations of traditional IDS approaches, providing high accuracy, robustness, and explainability through a user‑friendly dashboard.

🔹 Why This Project?
Cyberattacks are becoming more sophisticated (APTs, fileless malware, multi‑vector attacks).

Traditional IDS (signature‑based, anomaly‑based) struggle with zero‑day exploits, false positives, and encrypted traffic.

Machine learning models improve detection but fail with high‑dimensional data and imbalanced datasets (rare attacks like R2L/U2R).

Deep learning, especially ResNet, solves these challenges by automatically learning complex patterns and improving detection accuracy.

🔹 Key Features
ResNet‑based IDS model for robust classification of attacks.

Balanced dataset training (NSL‑KDD) to improve detection of rare intrusions.

Real‑time traffic capture using Scapy for adaptability to live networks.

Adversarial detection mechanisms to flag low‑confidence predictions and resist evasion attacks.

Integrated dashboard with four functional tabs:

Upload & Detect

Threat Logs

Traffic Analysis

Integrity Monitor

🔹 Technologies Used
Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn‑ui

Backend: Node.js, Scapy integration for live traffic capture

Model: ResNet deep learning architecture trained on NSL‑KDD dataset

Deployment: Lovable platform with option for custom domain

🔹 Academic Relevance
This project is developed as part of a B.Tech Computer Science & Engineering academic submission, under the mentorship of Mr. Madhav Bansal.
It demonstrates:

Application of deep learning in cybersecurity

Integration of AI model security metrics (adversarial robustness, integrity monitoring)


A panel‑friendly dashboard for clear visualization and usability
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd SecureNet-AI-IDS

# Step 3: Install dependencies.
npm i

# Step 4: Start the development server.
npm run dev
