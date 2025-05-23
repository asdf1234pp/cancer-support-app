const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8000;

app.use(bodyParser.json());
app.use(express.static('public'));

const USERS_FILE = './users.json';

// 파일에서 유저 데이터 읽기
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

// 파일에 유저 데이터 저장
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 회원가입 엔드포인트
app.post('/api/register', (req, res) => {
  const { username, password, name, cancerType, contact, detail } = req.body;
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  users.push({ username, password, name, cancerType, contact, detail });
  writeUsers(users);
  res.json({ success: true });
});

// 로그인 엔드포인트
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true, username, name: user.name });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 기존 코드 위에 아래 엔드포인트 추가

// 내 정보 읽기
app.get('/api/me', (req, res) => {
  const { username } = req.query;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: "User not found" });
  // 프로필만 반환
  res.json(user.profile || {});
});

// 내 정보(프로필) 업데이트
app.post('/api/profile', (req, res) => {
  const { username, profile } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: "User not found" });
  // profile 업데이트
  user.profile = profile;
  writeUsers(users);
  res.json({ success: true });
});

const COMPANY_USERS_FILE = './company_users.json';

// 기업 로그인
app.post('/api/company-login', (req, res) => {
  const { username, password } = req.body;
  const companies = fs.existsSync(COMPANY_USERS_FILE) ? JSON.parse(fs.readFileSync(COMPANY_USERS_FILE)) : [];
  const user = companies.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid company credentials" });
  res.json({ success: true, company: user.company });
});

// 암환우 리스트(프로필만, 민감정보 제외)
app.get('/api/userlist', (req, res) => {
  const users = readUsers();
  // profile, username만 반환
  const list = users.map(u => ({
    username: u.username,
    ...u.profile
  }));
  res.json(list);
});
