import 'dotenv/config';
const base = `http://localhost:${process.env.PORT || 4000}/api`;
const checks = [
  ['health', '/health'], ['categories', '/categories'], ['products', '/products']
];
let failed = false;
for (const [name, path] of checks) {
  try {
    const response = await fetch(`${base}${path}`);
    const body = await response.text();
    console.log(`${response.ok ? 'PASS' : 'FAIL'} ${name}: HTTP ${response.status} ${body.slice(0, 300)}`);
    if (!response.ok) failed = true;
  } catch (error) { console.log(`FAIL ${name}: ${error.message}`); failed = true; }
}
const login = await fetch(`${base}/auth/admin/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'change-me' }) });
const loginBody = await login.json();
console.log(`${login.ok && loginBody.data?.token ? 'PASS' : 'FAIL'} admin login: HTTP ${login.status}`);
if (loginBody.data?.token) {
  const dashboard = await fetch(`${base}/admin/dashboard/stats`, { headers: { authorization: `Bearer ${loginBody.data.token}` } });
  console.log(`${dashboard.ok ? 'PASS' : 'FAIL'} dashboard (authenticated): HTTP ${dashboard.status} ${(await dashboard.text()).slice(0, 300)}`);
  if (!dashboard.ok) failed = true;
} else failed = true;
process.exitCode = failed ? 1 : 0;
